import { useContext, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { DimensionContext } from "@/context/DimensionContext";

const cursorStyles = {
  gateway:      { dot: "#FFFFFF", spark: "#FFFFFF", size: 8,  shape: "round" },
  professional: { dot: "#00E5FF", spark: "#00E5FF", size: 8,  shape: "cross" },
  personal:     { dot: "#D4A373", spark: "#D4A373", size: 10, shape: "round" },
  emotional:    { dot: "#FFB703", spark: "#FFB703", size: 10, shape: "flame" },
  recruiter: null,
};

let particleId = 0;

export default function CustomCursor() {
  const { dimension } = useContext(DimensionContext);
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState([]);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      // throttle particle emission (~every 35ms)
      const now = performance.now();
      if (now - lastSpawnRef.current > 35) {
        lastSpawnRef.current = now;
        const id = ++particleId;
        const drift = (Math.random() - 0.5) * 30;
        const driftY = -8 - Math.random() * 22;
        const size = 2 + Math.random() * 3;
        setParticles((prev) => [
          ...prev.slice(-18), // cap
          { id, x: e.clientX, y: e.clientY, drift, driftY, size },
        ]);
        // auto-remove after animation
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== id));
        }, 900);
      }
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  const style = cursorStyles[dimension];
  if (!style) return null;

  const isCross = style.shape === "cross";
  const isFlame = style.shape === "flame";

  return (
    <>
      {/* Sparkle / particle trail */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            data-testid="cursor-spark"
            initial={{ opacity: 0.9, scale: 1, x: p.x, y: p.y }}
            animate={{
              opacity: 0,
              scale: 0.2,
              x: p.x + p.drift,
              y: p.y + p.driftY,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: p.size,
              height: p.size,
              borderRadius: "9999px",
              background: style.spark,
              boxShadow: `0 0 ${p.size * 3}px ${style.spark}, 0 0 ${p.size * 6}px ${style.spark}`,
              pointerEvents: "none",
              zIndex: 9999,
              translateX: "-50%",
              translateY: "-50%",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main dot */}
      <motion.div
        className="cursor-dot"
        data-testid="custom-cursor-dot"
        style={{
          x,
          y,
          width: style.size,
          height: style.size,
          borderRadius: isCross ? 0 : "9999px",
          background: style.dot,
          opacity: visible ? 1 : 0,
          boxShadow: isFlame
            ? `0 0 18px ${style.dot}, 0 0 6px ${style.dot}`
            : `0 0 12px ${style.dot}66`,
          filter: isFlame ? "blur(0.4px)" : "none",
          mixBlendMode: dimension === "personal" ? "normal" : "screen",
        }}
        transition={{ opacity: { duration: 0.2 } }}
      />
    </>
  );
}
