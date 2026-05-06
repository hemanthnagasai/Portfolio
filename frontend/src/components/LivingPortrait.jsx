import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

const STAR_COUNT = 38;

export default function LivingPortrait({ src, alt = "Digital avatar" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [bursts, setBursts] = useState([]);
  const [whisperShown, setWhisperShown] = useState(false);

  // -1..1 normalized cursor position relative to portrait center
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotX = useSpring(useTransform(my, [-1, 1], [9, -9]), {
    stiffness: 80,
    damping: 14,
  });
  const rotY = useSpring(useTransform(mx, [-1, 1], [-11, 11]), {
    stiffness: 80,
    damping: 14,
  });

  // Light wash position (0..100 %)
  const lxRaw = useTransform(mx, [-1, 1], [15, 85]);
  const lyRaw = useTransform(my, [-1, 1], [15, 85]);
  const lightBg = useMotionTemplate`radial-gradient(circle 220px at ${lxRaw}% ${lyRaw}%, rgba(255,235,200,0.22), transparent 65%)`;

  // Subtle image parallax (independent layer depth)
  const imgX = useTransform(mx, [-1, 1], [6, -6]);
  const imgY = useTransform(my, [-1, 1], [4, -4]);

  // Track cursor → mx/my
  useEffect(() => {
    const handleMove = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      // clamp to [-1.4, 1.4] for slight overshoot
      mx.set(Math.max(-1.4, Math.min(1.4, dx)));
      my.set(Math.max(-1.4, Math.min(1.4, dy)));
    };
    const reset = () => {
      mx.set(0);
      my.set(0);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", reset);
    };
  }, [mx, my]);

  // Starfield canvas — stars drift toward cursor when it's near
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = wrapRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
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

    // stars in normalized 0..1 space
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      bx: Math.random(),
      by: Math.random(),
      ox: 0,
      oy: 0,
      r: Math.random() * 0.7 + 0.25,
      tw: Math.random() * Math.PI * 2,
      twS: 0.018 + Math.random() * 0.035,
    }));

    let mxN = -1; // normalized 0..1
    let myN = -1;
    let inside = false;
    const trackMouse = (e) => {
      const r = container.getBoundingClientRect();
      mxN = (e.clientX - r.left) / r.width;
      myN = (e.clientY - r.top) / r.height;
      inside = mxN >= -0.15 && mxN <= 1.15 && myN >= -0.15 && myN <= 1.15;
    };
    window.addEventListener("mousemove", trackMouse);

    let frame;
    const draw = () => {
      const r = container.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.tw += s.twS;
        let dx = mxN - s.bx;
        let dy = myN - s.by;
        const d = Math.hypot(dx, dy);
        if (inside && d < 0.45) {
          const pull = (0.45 - d) * 26;
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
        const flicker = (Math.sin(s.tw) + 1) * 0.5 * 0.4 + 0.3;
        // glow
        const grd = ctx.createRadialGradient(px, py, 0, px, py, s.r * 5);
        grd.addColorStop(0, `rgba(255,225,180,${flicker * 0.55})`);
        grd.addColorStop(1, "rgba(255,225,180,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, s.r * 5, 0, Math.PI * 2);
        ctx.fill();
        // core
        ctx.fillStyle = `rgba(255,245,220,${flicker * 0.75})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
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
    <div style={{ perspective: 1000 }} className="inline-block">
      <motion.div
        ref={wrapRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => {
          const id = Date.now() + Math.random();
          // 22 directional particles
          const ps = Array.from({ length: 22 }, (_, k) => ({
            id: id + k,
            angle: (k / 22) * Math.PI * 2 + Math.random() * 0.3,
            dist: 90 + Math.random() * 80,
            size: 1.5 + Math.random() * 2.5,
          }));
          setBursts((b) => [...b, ...ps]);
          setWhisperShown(true);
          setTimeout(() => {
            setBursts((b) => b.filter((p) => !ps.find((q) => q.id === p.id)));
          }, 1100);
          setTimeout(() => setWhisperShown(false), 2400);
        }}
        className="relative w-56 h-72 md:w-72 md:h-96 rounded-sm overflow-hidden cursor-pointer"
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        data-testid="living-portrait"
      >
        {/* Bottom dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 z-20 pointer-events-none" />

        {/* Image with subtle parallax — or initials fallback */}
        {src ? (
          <motion.img
            src={src}
            alt={alt}
            className="w-full h-full object-cover contrast-105"
            style={{ x: imgX, y: imgY, scale: 1.06 }}
            data-testid="gateway-avatar"
          />
        ) : (
          <motion.div
            className="w-full h-full flex items-center justify-center"
            style={{
              x: imgX,
              y: imgY,
              scale: 1.06,
              background:
                "radial-gradient(ellipse at 40% 30%, #1a1a2e 0%, #0d0d16 60%, #050508 100%)",
            }}
            data-testid="gateway-avatar"
          >
            <span
              className="font-cormorant font-light select-none"
              style={{
                fontSize: "clamp(4rem, 12vw, 7rem)",
                color: "rgba(255,235,180,0.18)",
                letterSpacing: "0.05em",
                textShadow: "0 0 60px rgba(255,183,3,0.25), 0 0 120px rgba(255,183,3,0.1)",
              }}
            >
              H
            </span>
          </motion.div>
        )}

        {/* breathing wrapper for image */}
        {/* (handled by inline animate below if needed) */}

        {/* Starfield overlay — additive only (cannot darken the face) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ mixBlendMode: "screen" }}
          aria-hidden
          data-testid="portrait-starfield"
        />

        {/* Light wash that follows cursor */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500"
          style={{
            background: lightBg,
            mixBlendMode: "screen",
            opacity: hovering ? 1 : 0.55,
          }}
        />

        {/* Subtle vignette */}
        <div className="absolute inset-0 pointer-events-none z-10 [box-shadow:inset_0_0_60px_rgba(0,0,0,0.55)]" />

        {/* Bottom labels */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-[10px] font-mono uppercase tracking-[0.25em] text-white/70 z-30">
          <span>A—01</span>
          <span>Reveal / Layered</span>
        </div>

        {/* Living indicator dot */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.3em] text-white/55">
          <span
            className="block w-1.5 h-1.5 rounded-full bg-[#FFB703]"
            style={{ boxShadow: "0 0 8px #FFB703, 0 0 16px #FFB703" }}
          />
          Live
        </div>

        {/* Click-bloom particles (portrait-bloom) */}
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
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                background: "#FFEFC2",
                borderRadius: "9999px",
                boxShadow: `0 0 ${p.size * 4}px #FFE19A, 0 0 ${p.size * 8}px rgba(255,225,154,0.5)`,
                mixBlendMode: "screen",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Whisper line below */}
      <AnimatePresence>
        {whisperShown && (
          <motion.p
            key="whisper"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            data-testid="portrait-whisper"
            className="mt-4 text-center font-cormorant italic text-sm md:text-base text-[#FFB703]/90"
          >
            You found me.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
