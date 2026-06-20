import { useContext, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { DimensionContext } from "@/context/DimensionContext";

interface CursorStyle {
  dot: string;
  spark: string;
  size: number;
  glow: string;
  ringColor: string;
}

const cursorStyles: Record<string, CursorStyle | null> = {
  gateway:      { dot: "#c8b6ff", spark: "#c8b6ff", size: 6,  glow: "rgba(200,182,255,0.5)", ringColor: "rgba(200,182,255,0.2)" },
  professional: { dot: "#00E5FF", spark: "#00E5FF", size: 6,  glow: "rgba(0,229,255,0.5)", ringColor: "rgba(0,229,255,0.15)" },
  personal:     { dot: "#FFB703", spark: "#FFB703", size: 6,  glow: "rgba(255,183,3,0.5)", ringColor: "rgba(255,183,3,0.15)" },
  emotional:    { dot: "#FFB703", spark: "#FFB703", size: 7,  glow: "rgba(255,183,3,0.6)", ringColor: "rgba(255,183,3,0.2)" },
  recruiter: null,
};

interface Particle {
  x: number;
  y: number;
  drift: number;
  driftY: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

export default function CustomCursor() {
  const { dimension } = useContext(DimensionContext);
  const [visible, setVisible] = useState(false);
  
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  // Springs for outer ring inertia
  const ringXSpring = useSpring(ringX, { stiffness: 120, damping: 20 });
  const ringYSpring = useSpring(ringY, { stiffness: 120, damping: 20 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const loopRunningRef = useRef(false);
  const lastSpawnRef = useRef(0);

  // Store dimension in ref to avoid mouse listeners recreation on world shifts
  const dimensionRef = useRef(dimension);
  useEffect(() => {
    dimensionRef.current = dimension;
  }, [dimension]);

  // Handle Canvas Resizing dynamically
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Frame animation loop for canvas particles
  const drawParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const activeStyle = cursorStyles[dimensionRef.current];
    if (!activeStyle) {
      particlesRef.current = [];
      loopRunningRef.current = false;
      return;
    }

    const activeParticles: Particle[] = [];
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life -= 16.67; // Approx time elapsed (60fps scale)

      if (p.life > 0) {
        const ratio = p.life / p.maxLife;
        const currentAlpha = p.alpha * ratio;
        const currentSize = p.size * ratio;
        const currentX = p.x + p.drift * (1 - ratio);
        const currentY = p.y + p.driftY * (1 - ratio);

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(currentX, currentY, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = activeStyle.spark;
        ctx.shadowColor = activeStyle.glow;
        ctx.shadowBlur = currentSize * 3.5;
        ctx.fill();
        ctx.restore();

        activeParticles.push(p);
      }
    }

    particlesRef.current = activeParticles;

    if (activeParticles.length > 0) {
      requestAnimationFrame(drawParticles);
    } else {
      loopRunningRef.current = false;
    }
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      ringX.set(e.clientX);
      ringY.set(e.clientY);

      const activeStyle = cursorStyles[dimensionRef.current];
      if (!activeStyle) return;

      const now = performance.now();
      // Throttle particle generation to prevent DOM overpopulation
      if (now - lastSpawnRef.current > 16) {
        lastSpawnRef.current = now;

        const drift = (Math.random() - 0.5) * 35;
        const driftY = -12 - Math.random() * 26;
        const size = 1.6 + Math.random() * 3.2;
        const maxLife = 1000 + Math.random() * 200;

        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          drift,
          driftY,
          size,
          alpha: 0.85,
          maxLife,
          life: maxLife,
        });

        if (!loopRunningRef.current) {
          loopRunningRef.current = true;
          requestAnimationFrame(drawParticles);
        }
      }
    };

    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, [x, y, ringX, ringY]);

  const style = cursorStyles[dimension];
  if (!style) return null;

  return (
    <>
      {/* High-performance particle canvas overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999 }}
      />

      {/* Outer glowing ring with inertia spring lag */}
      <motion.div
        className="cursor-ring"
        style={{
          x: ringXSpring,
          y: ringYSpring,
          width: 36,
          height: 36,
          borderRadius: "9999px",
          border: `1px solid ${style.ringColor}`,
          opacity: visible ? 0.6 : 0,
          boxShadow: `0 0 12px ${style.ringColor}`,
          mixBlendMode: "screen",
        }}
        transition={{ opacity: { duration: 0.2 } }}
      />

      {/* Main dot */}
      <motion.div
        className="cursor-dot"
        data-testid="custom-cursor-dot"
        style={{
          x,
          y,
          width: style.size,
          height: style.size,
          borderRadius: "9999px",
          background: style.dot,
          opacity: visible ? 1 : 0,
          boxShadow: `0 0 12px ${style.glow}, 0 0 24px ${style.glow}`,
          mixBlendMode: "screen",
        }}
        transition={{ opacity: { duration: 0.2 } }}
      />
    </>
  );
}
