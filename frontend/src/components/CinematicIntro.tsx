import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SENTENCE = "Some people are introduced. Some are revealed.";
const BARS_COUNT = 24;

// Precompute static animations for visualizer bars to prevent Math.random() on every render (and hydration mismatches)
const VISUALIZER_BARS = Array.from({ length: BARS_COUNT }).map((_, i) => {
  const seed = (i * 37) % 100;
  const minHeight = 4 + (seed % 6);
  const maxHeight = 12 + (seed % 12);
  const duration = 0.5 + (seed % 5) * 0.12;
  const delay = i * 0.035;
  return {
    heights: [minHeight, maxHeight, minHeight],
    duration,
    delay,
  };
});

export default function CinematicIntro() {
  const [show, setShow] = useState(false);
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);
  const [barsIn, setBarsIn] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  const timersRef = useRef<any[]>([]);
  const intervalRef = useRef<any | null>(null);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("intro_seen") === "1") return;

    setShow(true);

    // 1. Cinematic letterbox bars slide in
    timersRef.current.push(
      setTimeout(() => {
        setBarsIn(true);
      }, 200)
    );

    // 2. Start typing effect after initial delay
    timersRef.current.push(
      setTimeout(() => {
        let typedCount = 0;
        intervalRef.current = setInterval(() => {
          typedCount++;
          setTyped(typedCount);

          if (typedCount >= SENTENCE.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            // 3. Trigger text glitch effect on completion
            setGlitchActive(true);
            timersRef.current.push(
              setTimeout(() => {
                setGlitchActive(false);
              }, 600)
            );

            // 4. Begin iris wipe out
            timersRef.current.push(
              setTimeout(() => {
                setDone(true);
              }, 1100)
            );

            // 5. Complete intro and unmount
            timersRef.current.push(
              setTimeout(() => {
                sessionStorage.setItem("intro_seen", "1");
                setShow(false);
              }, 2000)
            );
          }
        }, 42);
      }, 900)
    );

    return () => {
      clearAllTimers();
    };
  }, []);

  const handleSkip = () => {
    clearAllTimers();
    sessionStorage.setItem("intro_seen", "1");
    setShow(false);
  };

  const text = SENTENCE.slice(0, typed);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          animate={{ opacity: done ? 0 : 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="fixed inset-0 flex items-center justify-center overflow-hidden"
          style={{ zIndex: 10000, background: "#020206" }}
          data-testid="cinematic-intro"
        >
          {/* Cinematic grain overlay */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix values=\'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.7 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              mixBlendMode: "overlay",
              backgroundSize: "200px 200px",
              animation: "grain-shift 0.5s steps(3) infinite",
            }}
          />

          {/* Cinematic letterbox bars */}
          <motion.div
            className="absolute top-0 left-0 right-0 bg-black"
            initial={{ height: 0 }}
            animate={{ height: barsIn ? "12vh" : 0 }}
            transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
            style={{ zIndex: 2 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-black"
            initial={{ height: 0 }}
            animate={{ height: barsIn ? "12vh" : 0 }}
            transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
            style={{ zIndex: 2 }}
          />

          {/* Lens flare sweep */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(200,182,255,0.15) 0%, transparent 60%)",
              filter: "blur(40px)",
              zIndex: 1,
            }}
            initial={{ x: "-50vw", y: "-20vh" }}
            animate={{ x: "50vw", y: "10vh" }}
            transition={{ duration: 4, delay: 0.5, ease: "easeInOut" }}
          />

          {/* Scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
            <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
              }}
              initial={{ top: "-5%" }}
              animate={{ top: "105%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Sound-wave visualizer bars */}
          <div
            className="absolute bottom-[15vh] left-1/2 -translate-x-1/2 flex items-end gap-[3px]"
            style={{ zIndex: 3, opacity: 0.15 }}
          >
            {VISUALIZER_BARS.map((bar, i) => (
              <motion.div
                key={i}
                className="w-[2px] bg-white/40 rounded-full"
                animate={{ height: bar.heights }}
                transition={{
                  duration: bar.duration,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: bar.delay,
                }}
              />
            ))}
          </div>

          {/* Main text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className={`font-display font-light text-white text-center px-6 max-w-4xl relative ${
              glitchActive ? "glitch-text" : ""
            }`}
            style={{
              fontSize: "clamp(26px, 4.2vw, 60px)",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              zIndex: 4,
            }}
            data-text={text}
            data-testid="intro-sentence"
          >
            {text}
            <span
              className="inline-block w-[3px] align-middle bg-white ml-1"
              style={{
                height: "0.85em",
                animation: "blink 800ms steps(2, start) infinite",
                boxShadow: "0 0 8px rgba(200,182,255,0.6), 0 0 20px rgba(200,182,255,0.3)",
              }}
            />
          </motion.p>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            whileHover={{ opacity: 1 }}
            onClick={handleSkip}
            data-testid="intro-skip"
            className="absolute bottom-[15vh] right-10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
            style={{ zIndex: 5 }}
          >
            Skip ↗
          </motion.button>

          {/* Iris wipe on exit */}
          {done && (
            <motion.div
              className="absolute inset-0"
              style={{
                background: "#020206",
                zIndex: 10,
              }}
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={{ clipPath: "circle(150% at 50% 50%)" }}
              transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
