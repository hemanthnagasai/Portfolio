import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODES, setVisitorMode, getVisitorMode } from "@/utils/visitorMode";

export default function VisitorModePrompt() {
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("intro_seen") !== "1") return; // wait for intro
    if (getVisitorMode()) return; // already chosen
    const t = setTimeout(() => setShow(true), 350);
    return () => clearTimeout(t);
  }, []);

  // Re-check after intro completes (poll briefly)
  useEffect(() => {
    if (show) return;
    if (getVisitorMode()) return;
    const i = setInterval(() => {
      if (sessionStorage.getItem("intro_seen") === "1" && !getVisitorMode()) {
        setShow(true);
        clearInterval(i);
      }
    }, 500);
    return () => clearInterval(i);
  }, [show]);

  const choose = (key: string) => {
    setVisitorMode(key);
    setExiting(true);
    setTimeout(() => setShow(false), 700);
    // notify listeners
    window.dispatchEvent(new Event("visitor-mode-changed"));
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="visitor-prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 flex items-center justify-center px-6"
          style={{
            zIndex: 9500,
            background:
              "radial-gradient(ellipse at center, rgba(8,8,12,0.92), rgba(0,0,0,0.97))",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
          data-testid="visitor-mode-prompt"
        >
          <div className="text-center max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/45 mb-8"
            >
              Before you choose a world
            </motion.p>
 
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="font-cormorant italic font-light text-white text-center"
              style={{ fontSize: "clamp(34px, 5.5vw, 76px)", lineHeight: 1.1 }}
            >
              Who are you, today?
            </motion.h2>
 
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-6 font-spectral italic text-white/55 text-base md:text-lg"
            >
              I'll show you the side of me that fits.
            </motion.p>
 
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {MODES.map((m, i) => (
                <motion.button
                  key={m.key}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 1.2 + i * 0.12 }}
                  whileHover={{ y: -3 }}
                  onClick={() => choose(m.key)}
                  data-testid={`visitor-choice-${m.key}`}
                  className="group flex items-center justify-between gap-6 px-6 py-5 border border-white/10 hover:border-white/55 bg-white/[0.02] hover:bg-white/[0.05] rounded-sm transition-colors text-left"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
                    {m.glyph}
                  </span>
                  <span className="flex-1 font-cormorant italic text-2xl md:text-3xl text-white/85 group-hover:text-white transition-colors">
                    {m.label}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/30 group-hover:text-[#FFB703] transition-colors">
                    →
                  </span>
                </motion.button>
              ))}
            </div>
 
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.9 }}
              whileHover={{ opacity: 1 }}
              onClick={() => choose("stranger")}
              data-testid="visitor-skip"
              className="mt-10 font-mono text-[10px] uppercase tracking-[0.35em] text-white/50 hover:text-white"
            >
              Just let me in →
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
