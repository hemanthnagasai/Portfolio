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
import { DimensionContext } from "@/context/DimensionContext";

function App() {
  const [dimension, setDimension] = useState("gateway");

  return (
    <DimensionContext.Provider value={{ dimension, setDimension }}>
      <div className="App">
        <BrowserRouter>
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
        </BrowserRouter>
      </div>
    </DimensionContext.Provider>
  );
}

export default App;
