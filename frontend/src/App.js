import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Gateway from "@/pages/Gateway";
import Professional from "@/pages/Professional";
import Personal from "@/pages/Personal";
import Emotional from "@/pages/Emotional";
import Recruiter from "@/pages/Recruiter";
import CustomCursor from "@/components/CustomCursor";
import NoiseOverlay from "@/components/NoiseOverlay";
import WorldSwitcher from "@/components/WorldSwitcher";
import CinematicIntro from "@/components/CinematicIntro";
import TransitionOverlay from "@/components/TransitionOverlay";
import { DimensionContext } from "@/context/DimensionContext";
import { TransitionContext } from "@/context/TransitionContext";

function App() {
  const [dimension, setDimension] = useState("gateway");
  const [transitionState, setTransitionState] = useState({ phase: "idle" });

  const trigger = ({ rect, color, to }) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTransitionState({ phase: "expanding", color, cx, cy, to });
  };

  return (
    <DimensionContext.Provider value={{ dimension, setDimension }}>
      <TransitionContext.Provider
        value={{ state: transitionState, setState: setTransitionState, trigger }}
      >
        <div className="App">
          <BrowserRouter>
            <CinematicIntro />
            <CustomCursor />
            <NoiseOverlay />
            <Routes>
              <Route path="/" element={<Gateway />} />
              <Route path="/professional" element={<Professional />} />
              <Route path="/personal" element={<Personal />} />
              <Route path="/emotional" element={<Emotional />} />
              <Route path="/recruiter" element={<Recruiter />} />
            </Routes>
            <WorldSwitcher />
            <TransitionOverlay />
          </BrowserRouter>
        </div>
      </TransitionContext.Provider>
    </DimensionContext.Provider>
  );
}

export default App;
