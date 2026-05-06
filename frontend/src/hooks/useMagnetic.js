import { useEffect, useRef } from "react";

/**
 * useMagnetic — applies a soft magnetic pull on an element when the cursor
 * is within `radius` pixels of its center. Smooth spring is handled via
 * a CSS transition on transform.
 */
export default function useMagnetic({ strength = 0.28, radius = 140 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) return;

    el.style.transition = "transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)";

    let frame = null;
    const move = (e) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const r = Math.max(rect.width, rect.height) * 0.5 + radius;
        if (dist < r) {
          const factor = (1 - dist / r) * strength;
          el.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
        } else {
          el.style.transform = "translate(0,0)";
        }
      });
    };
    const reset = () => {
      el.style.transform = "translate(0,0)";
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", reset);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength, radius]);

  return ref;
}
