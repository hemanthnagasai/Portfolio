import { useContext, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TransitionContext } from "@/context/TransitionContext";
import { playCut } from "@/lib/sfx";

const SWEEP_MS = 460;
const SWEEP_EASE = [0.65, 0, 0.35, 1] as const;

// The reels cut between scenes behind diagonal colour bands. Here an orange
// band leads, the destination's colour fills in behind it, the route
// changes underneath, and both carry on off the left edge.
function Bands({ color }: { color?: string }) {
  return (
    <div className="absolute inset-y-[-20%] left-0 flex w-[230vw] -skew-x-12">
      <div className="w-[14vw] shrink-0" style={{ background: "var(--orange)" }} />
      <div className="w-[8vw] shrink-0" style={{ background: "var(--ink)" }} />
      <div className="flex-1" style={{ background: color }} />
    </div>
  );
}

export default function TransitionOverlay() {
  const { state, setState } = useContext(TransitionContext);
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (state.phase === "expanding") {
      if (!reduced) playCut();
      const t = setTimeout(() => {
        if (state.to) navigate(state.to);
        setState((s) => ({ ...s, phase: reduced ? "idle" : "fading" }));
      }, reduced ? 0 : SWEEP_MS);
      return () => clearTimeout(t);
    }
    if (state.phase === "fading") {
      const t = setTimeout(() => setState({ phase: "idle" }), SWEEP_MS);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.to, navigate, setState, reduced]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {(state.phase === "expanding" || state.phase === "fading") && (
        <div key="sweep" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9000 }}>
          <motion.div
            key={state.phase}
            className="absolute inset-0"
            data-testid={state.phase === "expanding" ? "transition-expand" : "transition-fade"}
            initial={{ x: state.phase === "expanding" ? "105vw" : "-60vw" }}
            animate={{ x: state.phase === "expanding" ? "-60vw" : "-260vw" }}
            transition={{ duration: SWEEP_MS / 1000, ease: SWEEP_EASE }}
          >
            <Bands color={state.color} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
