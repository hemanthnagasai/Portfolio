import { useEffect, useRef } from "react";
import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  FogExp2,
  GridHelper,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { isTouchDevice, isWebGLAvailable } from "@/utils/device";

interface ThreeWorldProps {
  type: "professional" | "personal" | "emotional";
  candlelightActive?: boolean;
}

// Static, WebGL-free background shown when the browser/device can't render the 3D scene
// (old browsers, disabled GPU, some in-app webviews) instead of a blank or broken page.
const FALLBACK_GRADIENTS: Record<ThreeWorldProps["type"], string> = {
  professional: "radial-gradient(circle at 50% 30%, rgba(0,229,255,0.12), #030206 70%)",
  personal: "radial-gradient(circle at 50% 30%, rgba(34,48,36,0.35), #090d0a 70%)",
  emotional: "radial-gradient(circle at 50% 30%, rgba(255,183,3,0.1), #030206 70%)",
};

export default function ThreeWorld({ type, candlelightActive = false }: ThreeWorldProps) {
  // Computed once per mount; WebGL support doesn't change mid-session.
  const webglSupportedRef = useRef(isWebGLAvailable());
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const requestRef = useRef<number>(0);
  const stateRef = useRef({
    scroll: 0,
    targetScroll: 0,
    mouse: { x: 0, y: 0 },
    targetMouse: { x: 0, y: 0 },
    candlelightVal: 0,
    targetCandlelightVal: 0,
  });

  // Track props in refs for the loop
  useEffect(() => {
    stateRef.current.targetCandlelightVal = candlelightActive ? 1 : 0;
  }, [candlelightActive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webglSupportedRef.current) return;

    // --- Scene Setup ---
    const scene = new Scene();
    sceneRef.current = scene;

    // Transparent background
    scene.background = null;

    // --- Fog (Distant objects fade into background color) ---
    const fogColor = type === "professional" ? 0x030206 : type === "personal" ? 0x090d0a : 0x030206;
    scene.fog = new FogExp2(fogColor, 0.015);

    // --- Camera Setup ---
    const camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 30, 30);
    scene.add(camera);

    // --- Renderer Setup ---
    // Mobile/touch GPUs struggle most with antialiasing + real-time soft shadows;
    // drop both there rather than rendering the same scene quality everywhere.
    const lowPowerDevice = isTouchDevice();

    const renderer = new WebGLRenderer({
      antialias: !lowPowerDevice,
      alpha: true,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPowerDevice ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Soft shadows only on devices that can afford the extra draw passes
    renderer.shadowMap.enabled = !lowPowerDevice;
    renderer.shadowMap.type = PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Lighting Setup ---
    const ambientLightColor = type === "personal" ? 0x223024 : 0xffffff;
    const ambientLightIntensity = type === "personal" ? 0.18 : 0.3;
    const ambientLight = new AmbientLight(ambientLightColor, ambientLightIntensity);
    scene.add(ambientLight);

    const dirLightIntensity = type === "personal" ? 0.45 : 0.95;
    const dirLight = new DirectionalLight(0xffffff, dirLightIntensity);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 140;

    // shadow frustum
    const d = 45;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    // Candlelight local spot/point light for emotional mode
    let emotionalPointLight: PointLight | null = null;
    if (type === "emotional") {
      emotionalPointLight = new PointLight(0xffb703, 1.5, 45);
      emotionalPointLight.position.set(0, 0, 0);
      scene.add(emotionalPointLight);
      ambientLight.color.setHex(0x111122);
      ambientLight.intensity = 0.2;
    }

    // --- Memory Disposables Tracker ---
    const disposables: (BufferGeometry | Material)[] = [];
    const track = <T extends Object3D>(obj: T): T => {
      obj.traverse((child) => {
        if (child instanceof Mesh) {
          if (child.geometry) disposables.push(child.geometry);
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => disposables.push(m));
            } else {
              disposables.push(child.material);
            }
          }
        }
      });
      return obj;
    };

    // --- Path Position for Personal World ---
    const getPersonalPathPosition = (z: number): Vector3 => {
      const x = Math.sin(z * 0.08) * 8;
      const y = -6 + Math.cos(z * 0.05) * 1.5;
      return new Vector3(x, y, z);
    };

    // --- Abstract Memory Tree Creator ---
    const createMemoryTree = (height: number, radius: number): Group => {
      const group = new Group();
      
      // Thin dark wood trunk
      const trunkGeo = new CylinderGeometry(radius * 0.08, radius * 0.12, height, 12);
      const trunkMat = new MeshStandardMaterial({
        color: 0x8c7355, // lighter, softer wood color
        roughness: 0.9,
      });
      const trunk = new Mesh(trunkGeo, trunkMat);
      trunk.position.y = height / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      // Abstract warm glowing sphere canopy
      const canopyGeo = new SphereGeometry(radius, 24, 24);
      const canopyMat = new MeshStandardMaterial({
        color: 0xffb703, // glowing gold canopy
        transparent: true,
        opacity: 0.22,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xffb703,
        emissiveIntensity: 0.2,
      });
      const canopy = new Mesh(canopyGeo, canopyMat);
      canopy.position.y = height;
      canopy.castShadow = true;
      canopy.receiveShadow = true;
      group.add(canopy);

      // Mini glowing core
      const coreGeo = new SphereGeometry(radius * 0.25, 8, 8);
      const coreMat = new MeshBasicMaterial({ 
        color: 0xffe6a7,
        transparent: true,
        opacity: 0.75, 
      });
      const core = new Mesh(coreGeo, coreMat);
      core.position.y = height;
      group.add(core);

      return group;
    };;

    // --- Setup Scene Elements Per World Mode ---
    let roadPath1: CatmullRomCurve3 | null = null;
    const animObjects: { mesh: Object3D; speed: number; axis: "x" | "y" | "z"; offset?: number }[] = [];
    let flowLines: Line[] = [];

    // ─── 1. DATA SKY HIGHWAY (PROFESSIONAL) ───
    if (type === "professional") {
      const towerColors = [0x00f0ff, 0x00bcff, 0x00e5ff, 0x052e5c];
      
      // Cyber ground grid plane (Solid base, no floating elements)
      const gridGeo = new PlaneGeometry(160, 160, 16, 16);
      const gridMat = new MeshStandardMaterial({
        color: 0x00bcff,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      });
      const dataLandscape = new Mesh(gridGeo, gridMat);
      dataLandscape.rotation.x = -Math.PI / 2;
      dataLandscape.position.y = -8;
      dataLandscape.receiveShadow = true;
      scene.add(track(dataLandscape));

      // Solid ground backing so grid doesn't fade into void completely
      const floorGeo = new PlaneGeometry(160, 160);
      const floorMat = new MeshStandardMaterial({
        color: 0x030206,
        roughness: 0.8,
        metalness: 0.9,
      });
      const floor = new Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -8.05;
      floor.receiveShadow = true;
      scene.add(track(floor));

      // Towers on solid ground
      const towerCount = 35;
      const towerGroup = new Group();
      for (let i = 0; i < towerCount; i++) {
        const w = 1.6 + Math.random() * 3.4;
        const h = 5 + Math.random() * 18;
        const d = 1.6 + Math.random() * 3.4;

        const boxGeo = new BoxGeometry(w, h, d);
        const color = towerColors[Math.floor(Math.random() * towerColors.length)];
        const boxMat = new MeshStandardMaterial({
          color: color,
          roughness: 0.25,
          metalness: 0.8,
          transparent: true,
          opacity: 0.15,
        });

        const tower = new Mesh(boxGeo, boxMat);
        const angle = Math.random() * Math.PI * 2;
        const dist = 12 + Math.random() * 25;
        tower.position.x = Math.cos(angle) * dist;
        tower.position.z = Math.sin(angle) * dist;
        tower.position.y = h / 2 - 8;
        tower.castShadow = true;
        tower.receiveShadow = true;

        const edges = new EdgesGeometry(boxGeo);
        const lineMat = new LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.35,
        });
        const edgeLines = new LineSegments(edges, lineMat);
        tower.add(edgeLines);

        towerGroup.add(tower);
      }
      scene.add(track(towerGroup));

      // Floating data crystals
      const crystalCount = 14;
      for (let i = 0; i < crystalCount; i++) {
        const size = 0.5 + Math.random() * 0.7;
        const crystalGeo = new OctahedronGeometry(size);
        const color = i % 2 === 0 ? 0x00e5ff : 0x00f0ff;
        const crystalMat = new MeshStandardMaterial({
          color: color,
          roughness: 0.1,
          metalness: 0.9,
          emissive: color,
          emissiveIntensity: 0.25,
        });
        const crystal = new Mesh(crystalGeo, crystalMat);
        crystal.position.set(
          (Math.random() - 0.5) * 45,
          -2 + Math.random() * 12,
          (Math.random() - 0.5) * 45
        );
        crystal.castShadow = true;
        scene.add(track(crystal));
        animObjects.push({ mesh: crystal, speed: 0.012 + Math.random() * 0.008, axis: "y" });
      }

      // Flat Cyber Highway Ribbon
      roadPath1 = new CatmullRomCurve3([
        new Vector3(-35, -5, -35),
        new Vector3(-15, -4, -10),
        new Vector3(0, -5, 0),
        new Vector3(15, -3, 10),
        new Vector3(35, -5, 35),
      ]);

      const roadGeo = new TubeGeometry(roadPath1, 64, 1.2, 4, false);
      const roadMat = new MeshStandardMaterial({
        color: 0x081320,
        roughness: 0.4,
        metalness: 0.8,
        transparent: true,
        opacity: 0.7,
      });
      const highway = new Mesh(roadGeo, roadMat);
      highway.scale.set(1, 0.05, 1);
      highway.position.y = -8.05;
      highway.receiveShadow = true;
      scene.add(track(highway));

      // Data packets
      const packetGeo = new SphereGeometry(0.24, 8, 8);
      const packetMat = new MeshBasicMaterial({ color: 0x00f0ff });
      for (let j = 0; j < 5; j++) {
        const packet = new Mesh(packetGeo, packetMat);
        scene.add(track(packet));
        animObjects.push({
          mesh: packet,
          speed: 0.008 + Math.random() * 0.006,
          axis: "x",
          offset: (j / 5) * 1.0,
        });
      }
    }

    // ─── 2. WARM MEMORY STEPPING PATH (PERSONAL) ───
    let cloudsGroup: Group | null = null;
    if (type === "personal") {
      // Warm ground backing grid (for alignment/aesthetic depth)
      const groundGrid = new GridHelper(160, 40, 0xd4a373, 0xe8e3d9);
      groundGrid.position.y = -8;
      groundGrid.traverse((child) => {
        if (child instanceof LineSegments) {
          const mat = child.material as LineBasicMaterial;
          mat.transparent = true;
          mat.opacity = 0.04; // extremely faint and subtle
        }
      });
      scene.add(groundGrid);

      // Create a series of stepping stones winding along Z
      const stonesGroup = new Group();
      const stoneGeo = new CylinderGeometry(1.4, 1.4, 0.18, 16);
      const stoneMat = new MeshStandardMaterial({
        color: 0xe6dec9, // light sandstone cream color
        roughness: 0.95,
      });

      for (let z = -60; z <= 60; z += 5) {
        const stone = new Mesh(stoneGeo, stoneMat);
        const pos = getPersonalPathPosition(z);
        stone.position.copy(pos);
        stone.receiveShadow = true;
        stone.castShadow = true;
        stonesGroup.add(stone);
      }
      scene.add(track(stonesGroup));

      // Abstract Memory Trees placed alongside the path
      const forestGroup = new Group();
      const treeCount = 18;
      for (let i = 0; i < treeCount; i++) {
        const z = -50 + (i / (treeCount - 1)) * 100 + (Math.random() - 0.5) * 4;
        const pathPos = getPersonalPathPosition(z);

        const side = i % 2 === 0 ? 1 : -1;
        const xOffset = side * (6.5 + Math.random() * 3.5);
        const x = pathPos.x + xOffset;
        const y = pathPos.y;

        const tHeight = 2.5 + Math.random() * 1.5;
        const tRadius = 0.6 + Math.random() * 0.3;

        const tree = createMemoryTree(tHeight, tRadius);
        tree.position.set(x, y, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        forestGroup.add(tree);
      }
      scene.add(track(forestGroup));

      // Floating firefly memory particles
      const firefliesGroup = new Group();
      const fireflyCount = 25; // reduced count to reduce visual distraction
      for (let i = 0; i < fireflyCount; i++) {
        const size = 0.08 + Math.random() * 0.12;
        const geo = new SphereGeometry(size, 8, 8);
        const mat = new MeshBasicMaterial({
          color: 0xffb703, // bright glowing warm gold fireflies
          transparent: true,
          opacity: 0.55, // clearly visible glowing points in the dark forest
        });
        const firefly = new Mesh(geo, mat);

        const z = (Math.random() - 0.5) * 120;
        const pathPos = getPersonalPathPosition(z);
        const x = pathPos.x + (Math.random() - 0.5) * 20;
        const y = pathPos.y + 1 + Math.random() * 10;

        firefly.position.set(x, y, z);
        firefliesGroup.add(firefly);

        animObjects.push({
          mesh: firefly,
          speed: 0.006 + Math.random() * 0.008,
          axis: "y",
          offset: Math.random() * Math.PI * 2,
        });
      }
      scene.add(track(firefliesGroup));

      // Slow drifting flat translucent clouds
      cloudsGroup = new Group();
      const cloudCount = 8;
      const cloudMat = new MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.06,
        roughness: 0.95,
      });
      for (let i = 0; i < cloudCount; i++) {
        const w = 18 + Math.random() * 18;
        const h = 0.4;
        const d = 8 + Math.random() * 8;
        const cloudGeo = new BoxGeometry(w, h, d);
        const cloud = new Mesh(cloudGeo, cloudMat);
        
        cloud.position.set(
          (Math.random() - 0.5) * 60,
          6 + Math.random() * 6,
          (Math.random() - 0.5) * 100
        );
        cloudsGroup.add(cloud);
      }
      scene.add(track(cloudsGroup));
    }

    // ─── 3. NIGHT SKY CONSTELLATION SPIRAL (EMOTIONAL) ───
    let emotionalCandles: Group[] = [];
    if (type === "emotional") {
      const starCount = 2500;
      const starGeo = new BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 45 + Math.random() * 85;
        starPos[i] = radius * Math.sin(phi) * Math.cos(theta);
        starPos[i+1] = radius * Math.sin(phi) * Math.sin(theta);
        starPos[i+2] = radius * Math.cos(phi);
      }
      starGeo.setAttribute("position", new BufferAttribute(starPos, 3));
      const starMat = new PointsMaterial({
        color: 0xffffff,
        size: 0.25,
        transparent: true,
        opacity: 0.65,
      });
      const starfield = new Points(starGeo, starMat);
      scene.add(track(starfield));

      const spiralPoints: Vector3[] = [];
      const spiralSegmentCount = 120;
      for (let i = 0; i < spiralSegmentCount; i++) {
        const t = i / spiralSegmentCount;
        const theta = t * Math.PI * 6.5;
        const r = 24 - t * 20;
        const y = 25 - t * 50;
        spiralPoints.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
      }
      const spiralCurve = new CatmullRomCurve3(spiralPoints);
      const spiralPts = spiralCurve.getPoints(200);
      const spiralGeo = new BufferGeometry().setFromPoints(spiralPts);
      const spiralMat = new LineDashedMaterial({
        color: 0xffb703,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.4,
      });
      const spiralLine = new Line(spiralGeo, spiralMat);
      spiralLine.computeLineDistances();
      scene.add(track(spiralLine));

      // Floating Candle Lanterns along spiral
      const candleCount = 18;
      const candleGroup = new Group();
      for (let i = 0; i < candleCount; i++) {
        const u = (i + 1) / (candleCount + 1);
        const cPos = spiralCurve.getPointAt(u);

        const candle = new Group();
        candle.position.copy(cPos);

        const baseGeo = new CylinderGeometry(0.3, 0.3, 0.7, 12);
        const baseMat = new MeshStandardMaterial({
          color: 0x3d2b1f,
          roughness: 0.6,
          metalness: 0.8,
        });
        const base = new Mesh(baseGeo, baseMat);
        base.castShadow = true;
        base.receiveShadow = true;
        candle.add(base);

        const flameGeo = new SphereGeometry(0.16, 8, 8);
        const flameMat = new MeshBasicMaterial({ color: 0xffb703 });
        const flame = new Mesh(flameGeo, flameMat);
        flame.position.y = 0.45;
        candle.add(flame);

        const candleLight = new PointLight(0xffb703, 0.5, 6);
        candleLight.position.set(0, 0.45, 0);
        candleLight.castShadow = true;
        candle.add(candleLight);

        candleGroup.add(candle);
        emotionalCandles.push(candle);

        animObjects.push({
          mesh: candle,
          speed: 0.002,
          axis: "y",
          offset: i * Math.PI * 0.4,
        });
      }
      scene.add(track(candleGroup));
    }

    // --- Window Event Listeners ---
    const handleScroll = () => {
      const scrollH = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollH > 0) {
        stateRef.current.targetScroll = window.scrollY / scrollH;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      stateRef.current.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      stateRef.current.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation Rendering Loop ---
    let lastTime = 0;
    const animate = (now: number) => {
      if (lastTime === 0) lastTime = now;
      let delta = now - lastTime;
      // Cap delta at 100ms to avoid huge jumps during tab suspension or frame drops
      if (delta > 100) delta = 16.67;
      lastTime = now;
      requestRef.current = requestAnimationFrame(animate);

      // Frame-rate independent Lerp factors (scaled from 60fps base of 16.67ms)
      const deltaFactor = delta / 16.67;
      const scrollFactor = 1 - Math.pow(1 - 0.07, deltaFactor);
      const mouseFactor = 1 - Math.pow(1 - 0.05, deltaFactor);
      const candleFactor = 1 - Math.pow(1 - 0.08, deltaFactor);

      stateRef.current.scroll += (stateRef.current.targetScroll - stateRef.current.scroll) * scrollFactor;
      stateRef.current.mouse.x += (stateRef.current.targetMouse.x - stateRef.current.mouse.x) * mouseFactor;
      stateRef.current.mouse.y += (stateRef.current.targetMouse.y - stateRef.current.mouse.y) * mouseFactor;
      stateRef.current.candlelightVal += (stateRef.current.targetCandlelightVal - stateRef.current.candlelightVal) * candleFactor;

      const s = stateRef.current.scroll;
      const mx = stateRef.current.mouse.x;
      const my = stateRef.current.mouse.y;

      // ─── Camera Pathing (Swirling Flight Down Highway Valley) ───
      if (type === "professional") {
        const theta = s * Math.PI * 2.8 + mx * 0.15;
        const radius = 32 - s * 16 + my * 2;
        const camX = Math.cos(theta) * radius;
        const camZ = Math.sin(theta) * radius;
        const camY = 32 - s * 28 + my * 2;

        camera.position.set(camX, camY, camZ);
        const targetLookY = 4 - s * 8;
        camera.lookAt(0, targetLookY, 0);
      } 
      else if (type === "personal") {
        // Camera flies forward down the winding stepping-stone path
        const camZ = -50 + s * 100;
        const pathPos = getPersonalPathPosition(camZ);
        
        // Swirling spiral offset around the path centerline - shrunken to prevent tree collisions
        const swirlTheta = s * Math.PI * 2.5 + mx * 0.12;
        const swirlRadius = 2.6 * (1.0 - s * 0.25) + my * 0.5;
        
        const camX = pathPos.x + Math.cos(swirlTheta) * swirlRadius;
        const camY = pathPos.y + 5.2 + Math.sin(swirlTheta) * 0.8;

        camera.position.set(camX, camY, camZ);
        
        // Camera looks ahead of its Z path
        const lookZ = Math.min(55, camZ + 14);
        const lookPos = getPersonalPathPosition(lookZ);
        camera.lookAt(lookPos.x, lookPos.y + 0.8, lookPos.z);
      } 
      else if (type === "emotional") {
        const theta = s * Math.PI * 4.2 + mx * 0.2;
        const radius = 16 - s * 12 + my * 1.5;
        const camX = Math.cos(theta) * radius;
        const camZ = Math.sin(theta) * radius;
        const camY = 22 - s * 45;

        camera.position.set(camX, camY, camZ);
        camera.lookAt(0, camY - 6, 0);

        if (emotionalPointLight) {
          ambientLight.intensity = 0.35 * (1.0 - stateRef.current.candlelightVal * 0.75);
          dirLight.intensity = 0.9 * (1.0 - stateRef.current.candlelightVal * 0.9);

          const flicker = 1.0 + Math.sin(now * 0.02) * 0.05 + Math.sin(now * 0.007) * 0.03;
          emotionalPointLight.intensity = stateRef.current.candlelightVal * 2.5 * flicker;
          emotionalPointLight.position.set(camX * 0.3, camY - 4, camZ * 0.3);
        }

        emotionalCandles.forEach((c, idx) => {
          const cLight = c.children[2] as PointLight;
          if (cLight) {
            const indFlicker = 1.0 + Math.sin(now * 0.01 + idx) * 0.1;
            cLight.intensity = (0.35 + stateRef.current.candlelightVal * 0.65) * indFlicker;
          }
        });
      }

      // ─── Object Idle Animations ───
      const idleFactor = prefersReducedMotion ? 0.15 : 1;
      animObjects.forEach((obj) => {
        if (obj.axis === "y") {
          const offsetVal = obj.offset || 0;
          obj.mesh.position.y += Math.sin(now * obj.speed + offsetVal) * 0.0035 * idleFactor;
          obj.mesh.rotation.y += 0.002 * idleFactor;
        } else if (obj.axis === "x" && obj.offset !== undefined && roadPath1) {
          obj.offset += obj.speed * (delta / 16);
          if (obj.offset > 1.0) obj.offset = 0;

          const pos = roadPath1.getPointAt(obj.offset);
          obj.mesh.position.copy(pos);
        }
      });

      if (cloudsGroup) {
        cloudsGroup.rotation.y += 0.00035 * idleFactor;
      }



      renderer.render(scene, camera);
    };

    requestRef.current = requestAnimationFrame(animate);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      disposables.forEach((item) => {
        if (item) item.dispose();
      });

      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [type]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid={`three-world-${type}`}
      className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
      style={{
        zIndex: 0,
        background: webglSupportedRef.current ? undefined : FALLBACK_GRADIENTS[type],
      }}
    />
  );
}
