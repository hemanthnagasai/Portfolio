import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useState, Suspense, lazy } from "react";
import Gateway from "@/pages/Gateway";
import WorldSwitcher from "@/components/WorldSwitcher";
import TransitionOverlay from "@/components/TransitionOverlay";
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
const Privacy = lazy(() => import("@/pages/Privacy"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  const [dimension, setDimension] = useState<string>("gateway");
  const [transitionState, setTransitionState] = useState<TransitionState>({ phase: "idle" });

  const trigger = ({ color, to }: { color: string; to: string }) => {
    setTransitionState({ phase: "expanding", color, to });
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
              <div id="main-content">
              <Suspense fallback={<div className="fixed inset-0 bg-cream" />}>
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
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<NotFound />} />
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
