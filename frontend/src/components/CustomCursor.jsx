import { useContext, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { DimensionContext } from "@/context/DimensionContext";

const cursorStyles = {
  gateway: { dot: "#FFFFFF", ring: "rgba(255,255,255,0.35)", size: 10 },
  professional: { dot: "#00E5FF", ring: "rgba(0,229,255,0.5)", size: 10, shape: "cross" },
  personal: { dot: "#D4A373", ring: "rgba(212,163,115,0.35)", size: 12, shape: "soft" },
  emotional: { dot: "#FFB703", ring: "rgba(255,183,3,0.35)", size: 14, shape: "flame" },
  recruiter: null,
};

export default function CustomCursor() {
  const { dimension } = useContext(DimensionContext);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { damping: 25, stiffness: 200, mass: 0.4 });
  const ringY = useSpring(y, { damping: 25, stiffness: 200, mass: 0.4 });

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
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
          boxShadow: isFlame ? `0 0 24px ${style.dot}, 0 0 8px ${style.dot}` : "none",
          filter: isFlame ? "blur(0.5px)" : "none",
        }}
        transition={{ opacity: { duration: 0.2 } }}
      />
      <motion.div
        className="cursor-ring"
        data-testid="custom-cursor-ring"
        style={{
          x: ringX,
          y: ringY,
          width: style.size * 3.6,
          height: style.size * 3.6,
          borderRadius: isCross ? 0 : "9999px",
          border: `1px solid ${style.ring}`,
          opacity: visible ? 0.8 : 0,
          filter: isFlame ? "blur(6px)" : "none",
          background: isFlame ? `radial-gradient(circle, ${style.ring}, transparent 70%)` : "transparent",
        }}
        transition={{ opacity: { duration: 0.3 } }}
      />
    </>
  );
}
