import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STAR_COUNT = 55;

interface LivingPortraitProps {
  src?: string;
  alt?: string;
}

interface Star {
  bx: number;
  by: number;
  ox: number;
  oy: number;
  r: number;
  tw: number;
  twS: number;
  depth: number;
}

interface BurstParticle {
  id: number;
  angle: number;
  dist: number;
  size: number;
}

export default function LivingPortrait({ src = "/avatar.jpeg", alt = "Hemanth digital avatar" }: LivingPortraitProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovering, setHovering] = useState(false);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);

  const handleSparkClick = () => {
    // Faint burst of light sparks when clicking the photo - pure visual
    const id = Date.now() + Math.random();
    const ps: BurstParticle[] = Array.from({ length: 16 }, (_, k) => ({
      id: id + k,
      angle: (k / 16) * Math.PI * 2 + Math.random() * 0.25,
      dist: 50 + Math.random() * 60,
      size: 1 + Math.random() * 2,
    }));
    setBursts((b) => [...b, ...ps]);
    setTimeout(() => {
      setBursts((b) => b.filter((p) => !ps.find((q) => q.id === p.id)));
    }, 1000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = wrapRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const r = container.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      bx: Math.random(),
      by: Math.random(),
      ox: 0,
      oy: 0,
      r: Math.random() * 0.8 + 0.2,
      tw: Math.random() * Math.PI * 2,
      twS: 0.015 + Math.random() * 0.03,
      depth: Math.random(),
    }));

    let mxN = -1;
    let myN = -1;
    let inside = false;
    const trackMouse = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mxN = (e.clientX - r.left) / r.width;
      myN = (e.clientY - r.top) / r.height;
      inside = mxN >= -0.15 && mxN <= 1.15 && myN >= -0.15 && myN <= 1.15;
    };
    window.addEventListener("mousemove", trackMouse);

    let frame: number;
    const draw = () => {
      const r = container.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      ctx.clearRect(0, 0, w, h);
      
      stars.forEach((s) => {
        s.tw += s.twS;
        const dx = mxN - s.bx;
        const dy = myN - s.by;
        const d = Math.hypot(dx, dy);
        const parallax = 0.5 + s.depth * 0.5;

        if (inside && d < 0.45) {
          const pull = (0.45 - d) * 26 * parallax;
          const tx = dx * pull;
          const ty = dy * pull;
          s.ox += (tx - s.ox) * 0.06;
          s.oy += (ty - s.oy) * 0.06;
        } else {
          s.ox += (0 - s.ox) * 0.05;
          s.oy += (0 - s.oy) * 0.05;
        }
        const px = s.bx * w + s.ox;
        const py = s.by * h + s.oy;
        
        const flicker = (Math.sin(s.tw) + 1) * 0.5 * 0.5 + 0.25;
        const sizeMultiplier = 0.6 + s.depth * 0.6;

        const glowColor = "200,182,255";
        const grd = ctx.createRadialGradient(px, py, 0, px, py, s.r * 6 * sizeMultiplier);
        grd.addColorStop(0, `rgba(${glowColor},${flicker * 0.5})`);
        grd.addColorStop(0.5, `rgba(${glowColor},${flicker * 0.15})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, s.r * 6 * sizeMultiplier, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(240,235,255,${flicker * 0.8})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r * sizeMultiplier, 0, Math.PI * 2);
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", trackMouse);
    };
  }, []);

  return (
    <div className="inline-block relative">
      <motion.div
        ref={wrapRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={handleSparkClick}
        whileHover={{ scale: 1.015 }}
        className="relative w-56 h-72 md:w-72 md:h-96 rounded-2xl overflow-hidden cursor-pointer select-none"
        style={{ background: "var(--bg-void)" }}
        data-testid="living-portrait"
      >
        {/* Sleek outer glass card frame border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            zIndex: 30,
            border: "1.5px solid rgba(255,255,255,0.06)",
            boxShadow: hovering 
              ? "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(200,182,255,0.05)"
              : "0 10px 30px rgba(0,0,0,0.4)",
            transition: "border 300ms ease, box-shadow 300ms ease"
          }}
        />

        {/* Animated concentric ring of light on hover */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            width: "110%",
            height: "110%",
            borderRadius: "50%",
            border: "1px solid rgba(200,182,255,0.1)",
            animation: "rotate-ring 12s linear infinite",
            zIndex: 0,
            opacity: hovering ? 0.35 : 0.08,
            transition: "opacity 500ms ease",
            background: `conic-gradient(from 0deg, transparent 0%, rgba(200,182,255,0.08) 10%, transparent 20%, transparent 50%, rgba(0,229,255,0.05) 60%, transparent 70%)`,
          }}
        />

        {/* Dark bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35 z-20 pointer-events-none rounded-2xl" />

        {/* Photo Image */}
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover rounded-2xl"
            style={{ 
              filter: hovering ? "contrast(1.03) saturate(0.95)" : "none",
              transition: "filter 300ms ease"
            }}
            data-testid="gateway-avatar"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center rounded-2xl"
            style={{
              background: "radial-gradient(ellipse at 40% 30%, #1a1a2e 0%, #0d0d16 60%, #050508 100%)",
            }}
            data-testid="gateway-avatar"
          >
            <span
              className="font-display font-light select-none animate-pulse"
              style={{
                fontSize: "clamp(4rem, 12vw, 7rem)",
                color: "rgba(200,182,255,0.18)",
                letterSpacing: "0.05em",
                textShadow: "0 0 60px rgba(200,182,255,0.25), 0 0 120px rgba(200,182,255,0.1)",
              }}
            >
              H
            </span>
          </div>
        )}

        {/* Interactive Star canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ mixBlendMode: "screen", opacity: hovering ? 0.8 : 0.5, transition: "opacity 300ms ease" }}
          aria-hidden
          data-testid="portrait-starfield"
        />

        {/* Holographic shimmer on hover */}
        <div
          className="holo-shimmer z-20"
          style={{ 
            opacity: hovering ? 0.25 : 0.08, 
            transition: "opacity 600ms ease" 
          }}
        />

        {/* Inner shadow */}
        <div
          className="absolute inset-0 pointer-events-none z-20 rounded-2xl"
          style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.45)" }}
        />

        {/* Click sparks */}
        <div
          className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
          data-testid="portrait-bloom"
        >
          {bursts.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos(p.angle) * p.dist,
                y: Math.sin(p.angle) * p.dist,
                opacity: 0,
              }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                background: "#c8b6ff",
                borderRadius: "9999px",
                boxShadow: `0 0 ${p.size * 4}px #c8b6ff, 0 0 ${p.size * 8}px rgba(200,182,255,0.4)`,
                mixBlendMode: "screen",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
