import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";

export default function LayerZero() {
  const { setDimension } = useContext(DimensionContext);
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    setDimension("emotional"); // closest cursor flavor
    document.documentElement.style.setProperty("--grain-opacity", "0.07");
    window.scrollTo(0, 0);
    // staged reveal
    const t1 = setTimeout(() => setRevealStep(1), 800);
    const t2 = setTimeout(() => setRevealStep(2), 2200);
    const t3 = setTimeout(() => setRevealStep(3), 3800);
    const t4 = setTimeout(() => setRevealStep(4), 5400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [setDimension]);

  return (
    <main
      className="min-h-screen relative"
      style={{
        background:
          "radial-gradient(ellipse at 50% -10%, rgba(255,255,255,0.06), transparent 60%), #050505",
        color: "#F5F5F5",
      }}
      data-testid="layer-zero-page"
    >
      {/* TOP BAR */}
      <div className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40">
        <Link to="/" className="hover:text-white transition-colors" data-testid="zero-back-link">
          <span className="inline-flex items-center gap-2">
            <ArrowLeft size={12} /> Gateway
          </span>
        </Link>
        <span>Layer · 00</span>
      </div>

      <section className="relative z-10 px-6 md:px-12 max-w-2xl mx-auto py-24 md:py-40">
        {/* kicker */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: revealStep >= 1 ? 1 : 0, y: revealStep >= 1 ? 0 : 8 }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/40 mb-12"
        >
          You stayed.
        </motion.p>

        {/* main paragraph */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(6px)", y: 16 }}
          animate={{
            opacity: revealStep >= 2 ? 1 : 0,
            filter: revealStep >= 2 ? "blur(0px)" : "blur(6px)",
            y: revealStep >= 2 ? 0 : 16,
          }}
          transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-cormorant italic font-light text-3xl md:text-[44px] leading-[1.4] text-white"
          data-testid="zero-paragraph"
        >
          This page doesn't appear on first visits.
          <br />
          It appears for the people who linger.
          <br />
          You're one of them now.
        </motion.p>

        {/* polaroid */}
        <motion.figure
          initial={{ opacity: 0, y: 24, rotate: -2 }}
          animate={{
            opacity: revealStep >= 3 ? 1 : 0,
            y: revealStep >= 3 ? 0 : 24,
            rotate: revealStep >= 3 ? -1.5 : -2,
          }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-20 mx-auto w-fit p-3 pb-12 bg-[#F4F1E9] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]"
          data-testid="zero-polaroid"
        >
          <img
            alt="A quiet morning"
            src="https://images.unsplash.com/photo-1502810365585-a4b76f64a13c?crop=entropy&cs=srgb&fm=jpg&w=520&q=70"
            className="w-64 md:w-80 h-64 md:h-72 object-cover grayscale contrast-105"
            loading="lazy"
          />
          <figcaption className="font-caveat text-[#5C6A5D] text-xl text-center mt-3">
            somewhere, someone is having their best day yet.
          </figcaption>
        </motion.figure>

        {/* lyric */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: revealStep >= 4 ? 1 : 0 }}
          transition={{ duration: 1.8 }}
          className="mt-24 text-center font-playfair italic text-2xl md:text-3xl text-[#FFB703] leading-relaxed"
          data-testid="zero-lyric"
        >
          “If you find me here,<br />you've already found enough.”
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealStep >= 4 ? 1 : 0 }}
          transition={{ duration: 2, delay: 1.2 }}
          className="mt-20 text-center"
        >
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40 hover:text-white/80 transition-colors duration-300"
          >
            ← Return to the worlds when you're ready
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
