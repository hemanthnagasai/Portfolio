import { useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TransitionContext } from "@/context/TransitionContext";

export default function TransitionOverlay() {
  const { state, setState } = useContext(TransitionContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.phase === "expanding") {
      const t = setTimeout(() => {
        if (state.to) navigate(state.to);
        setState((s) => ({ ...s, phase: "fading" }));
      }, 800);
      return () => clearTimeout(t);
    }
    if (state.phase === "fading") {
      const t = setTimeout(() => setState({ phase: "idle" }), 900);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.to, navigate, setState]);

  return (
    <AnimatePresence>
      {state.phase === "expanding" && (
        <>
          {/* Main iris wipe */}
          <motion.div
            key="expand"
            className="fixed inset-0 pointer-events-none"
            style={{ background: state.color, zIndex: 9000 }}
            data-testid="transition-expand"
            initial={{
              clipPath: `circle(0px at ${state.cx}px ${state.cy}px)`,
            }}
            animate={{
              clipPath: `circle(160% at ${state.cx}px ${state.cy}px)`,
            }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          />
          {/* Motion blur flash */}
          <motion.div
            key="blur-flash"
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 9001,
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </>
      )}
      {state.phase === "fading" && (
        <motion.div
          key="fade"
          className="fixed inset-0 pointer-events-none"
          style={{ background: state.color, zIndex: 9000 }}
          data-testid="transition-fade"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}
