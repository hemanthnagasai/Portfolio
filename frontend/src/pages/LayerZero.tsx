import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";

export default function LayerZero() {
  const { setDimension } = useContext(DimensionContext);
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    setDimension("emotional");
    document.documentElement.style.setProperty("--grain-opacity", "0.06");
    window.scrollTo(0, 0);
    const t1 = setTimeout(() => setRevealStep(1), 800);
    const t2 = setTimeout(() => setRevealStep(2), 2200);
    const t3 = setTimeout(() => setRevealStep(3), 3800);
    const t4 = setTimeout(() => setRevealStep(4), 5400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [setDimension]);

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% -10%, rgba(200,182,255,0.04), transparent 60%), var(--bg-void)",
        color: "#F5F5F5",
      }}
      data-testid="layer-zero-page"
    >
      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => {
          const size = 1 + Math.random() * 2;
          const duration = 3 + Math.random() * 5;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `rgba(200,182,255,${0.15 + Math.random() * 0.3})`,
                boxShadow: `0 0 ${size * 3}px rgba(200,182,255,0.2)`,
                animation: `starfield-twinkle ${duration}s ease-in-out ${Math.random() * duration}s infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Slow rotating nebula */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "30%",
          left: "50%",
          width: "600px",
          height: "600px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse, rgba(200,182,255,0.03) 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "rotate-ring 60s linear infinite",
          zIndex: 0,
        }}
      />

      {/* TOP BAR */}
      <div
        className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/25"
      >
        <Link to="/" className="hover:text-white transition-colors" data-testid="zero-back-link">
          <span className="inline-flex items-center gap-2">
            <ArrowLeft size={12} /> Gateway
          </span>
        </Link>
        <span>Layer · 00</span>
      </div>

      <section className="relative z-10 px-6 md:px-12 max-w-2xl mx-auto py-24 md:py-40">
        {/* Kicker */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: revealStep >= 1 ? 1 : 0, y: revealStep >= 1 ? 0 : 8 }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/30 mb-12"
        >
          You stayed.
        </motion.p>

        {/* Main paragraph with focus-pull */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)", y: 16, scale: 1.03 }}
          animate={{
            opacity: revealStep >= 2 ? 1 : 0,
            filter: revealStep >= 2 ? "blur(0px)" : "blur(10px)",
            y: revealStep >= 2 ? 0 : 16,
            scale: revealStep >= 2 ? 1 : 1.03,
          }}
          transition={{ duration: 1.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-display font-light text-3xl md:text-[44px] leading-[1.4] text-white/90"
          data-testid="zero-paragraph"
        >
          This page doesn't appear on first visits.
          <br />
          It appears for the people who linger.
          <br />
          You're one of them now.
        </motion.p>

        {/* Polaroid in 3D space */}
        <motion.figure
          initial={{ opacity: 0, y: 24, rotateY: -6, rotateX: 3 }}
          animate={{
            opacity: revealStep >= 3 ? 1 : 0,
            y: revealStep >= 3 ? 0 : 24,
            rotateY: revealStep >= 3 ? -2 : -6,
            rotateX: revealStep >= 3 ? 1 : 3,
          }}
          transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-20 mx-auto w-fit perspective-container"
          data-testid="zero-polaroid"
        >
          <div
            className="glass-card p-3 pb-12"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6), 0 0 40px -10px rgba(200,182,255,0.08)",
              borderColor: "rgba(200,182,255,0.1)",
            }}
          >
            <div className="holo-shimmer" style={{ opacity: 0.1 }} />
            <img
              alt="A quiet morning"
              src="/mangalagiri.jpeg"
              className="w-64 md:w-80 h-64 md:h-72 object-cover rounded-lg relative z-10"
              style={{ filter: "grayscale(0.8) contrast(1.05)" }}
              loading="lazy"
            />
            <figcaption className="font-caveat text-white/50 text-xl text-center mt-3 relative z-10">
              mangalagiri, from above.
            </figcaption>
          </div>
        </motion.figure>

        {/* Lyric */}
        <motion.blockquote
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{
            opacity: revealStep >= 4 ? 1 : 0,
            filter: revealStep >= 4 ? "blur(0px)" : "blur(6px)",
          }}
          transition={{ duration: 1.8 }}
          className="mt-24 text-center font-playfair italic text-2xl md:text-3xl leading-relaxed"
          style={{
            color: "#c8b6ff",
            textShadow: "0 0 30px rgba(200,182,255,0.2)",
          }}
          data-testid="zero-lyric"
        >
          "If you find me here,<br />you've already found enough."
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealStep >= 4 ? 1 : 0 }}
          transition={{ duration: 2, delay: 1.2 }}
          className="mt-20 text-center"
        >
          <Link
            to="/"
            className="glass-pill px-4 py-2 font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white/60 transition-colors duration-300"
          >
            ← Return to the worlds when you're ready
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
