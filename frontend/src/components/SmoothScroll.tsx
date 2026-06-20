import { useEffect } from "react";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";
import { isTouchDevice } from "@/utils/device";

export default function SmoothScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable smooth scroll on recruiter view to avoid breaking standard browser mechanics
    if (pathname === "/recruiter") return;

    // Lenis hijacks scroll with a JS-driven RAF loop that competes with the Three.js
    // render loop for the main thread. Native touch scrolling is already smooth on
    // mobile, so skip Lenis there entirely rather than fighting the OS for scroll control.
    if (isTouchDevice()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Sync scroll to top on pathname changes
    lenis.scrollTo(0, { immediate: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
