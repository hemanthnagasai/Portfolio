import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useState, Suspense, lazy } from "react";
import Gateway from "@/pages/Gateway";
import CustomCursor from "@/components/CustomCursor";
import NoiseOverlay from "@/components/NoiseOverlay";
import WorldSwitcher from "@/components/WorldSwitcher";
import CinematicIntro from "@/components/CinematicIntro";
import TransitionOverlay from "@/components/TransitionOverlay";
import SmoothScroll from "@/components/SmoothScroll";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DimensionContext } from "@/context/DimensionContext";
import { TransitionContext, TransitionState } from "@/context/TransitionContext";

const Professional = lazy(() => import("@/pages/Professional"));
const Personal = lazy(() => import("@/pages/Personal"));
const Emotional = lazy(() => import("@/pages/Emotional"));
const Recruiter = lazy(() => import("@/pages/Recruiter"));
const LayerZero = lazy(() => import("@/pages/LayerZero"));
const Admin = lazy(() => import("@/pages/Admin"));
const Query = lazy(() => import("@/pages/Query"));
const HowIBuiltThis = lazy(() => import("@/pages/HowIBuiltThis"));
const Now = lazy(() => import("@/pages/Now"));

export default function App() {
  const [dimension, setDimension] = useState<string>("gateway");
  const [transitionState, setTransitionState] = useState<TransitionState>({ phase: "idle" });

  const trigger = ({ rect, color, to }: { rect: DOMRect; color: string; to: string }) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTransitionState({ phase: "expanding", color, cx, cy, to });
  };

  return (
    <MotionConfig reducedMotion="user">
    <DimensionContext.Provider value={{ dimension, setDimension }}>
      <TransitionContext.Provider
        value={{ state: transitionState, setState: setTransitionState, trigger }}
      >
        <div className="App">
          <BrowserRouter>
            <ErrorBoundary>
              <a href="#main-content" className="skip-link">Skip to content</a>
              <SmoothScroll />
              <CinematicIntro />
              <CustomCursor />
              <NoiseOverlay />
              <div id="main-content">
              <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#000" }} />}>
                <Routes>
                  <Route path="/" element={<Gateway />} />
                  <Route path="/professional" element={<Professional />} />
                  <Route path="/personal" element={<Personal />} />
                  <Route path="/emotional" element={<Emotional />} />
                  <Route path="/recruiter" element={<Recruiter />} />
                  <Route path="/zero" element={<LayerZero />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/query" element={<Query />} />
                  <Route path="/how-i-built-this" element={<HowIBuiltThis />} />
                  <Route path="/now" element={<Now />} />
                </Routes>
              </Suspense>
              </div>
              <WorldSwitcher />
              <TransitionOverlay />
            </ErrorBoundary>
          </BrowserRouter>
        </div>
      </TransitionContext.Provider>
    </DimensionContext.Provider>
    </MotionConfig>
  );
}
