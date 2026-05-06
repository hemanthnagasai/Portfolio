import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SENTENCE = "Some people are introduced. Some are revealed.";

export default function CinematicIntro() {
  const [show, setShow] = useState(false);
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("intro_seen") === "1") return;
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    let i = 0;
    const start = setTimeout(() => {
      const t = setInterval(() => {
        i += 1;
        setTyped(i);
        if (i >= SENTENCE.length) {
          clearInterval(t);
          setTimeout(() => setDone(true), 1100);
        }
      }, 42);
    }, 600);
    return () => clearTimeout(start);
  }, [show]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => {
        sessionStorage.setItem("intro_seen", "1");
        setShow(false);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [done]);

  const skip = () => {
    sessionStorage.setItem("intro_seen", "1");
    setShow(false);
  };

  if (!show) return null;
  const text = SENTENCE.slice(0, typed);

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        animate={{ opacity: done ? 0 : 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="fixed inset-0 bg-black flex items-center justify-center"
        style={{ zIndex: 10000 }}
        data-testid="cinematic-intro"
      >
        {/* heavy grain pulse */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0.25 }}
          animate={{ opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix values=\'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.7 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            mixBlendMode: "overlay",
          }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="font-cormorant italic font-light text-white text-center px-6 max-w-3xl"
          style={{ fontSize: "clamp(28px, 4.6vw, 64px)", lineHeight: 1.25 }}
          data-testid="intro-sentence"
        >
          {text}
          <span
            className="inline-block w-[3px] align-middle bg-white ml-1"
            style={{
              height: "0.85em",
              animation: "blink 800ms steps(2, start) infinite",
            }}
          />
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ opacity: 1 }}
          onClick={skip}
          data-testid="intro-skip"
          className="absolute bottom-10 right-10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white"
        >
          Skip ↗
        </motion.button>

        <style>{`@keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }`}</style>
      </motion.div>
    </AnimatePresence>
  );
}
