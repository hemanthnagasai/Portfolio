import { useContext, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import { emotional } from "@/data/portfolio";
import LeaveATrace from "@/components/LeaveATrace";
import { markVisited, ensureFirstVisit } from "@/hooks/useUnlock";
import { worldTopBarClass } from "@/constants/worldLayout";
import ThreeWorld from "@/components/ThreeWorld";

interface ParagraphProps {
  text: string;
  index: number;
}

function Paragraph({ text, index }: ParagraphProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 30, filter: "blur(10px)", scale: 1.02 }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.8, ease: [0.2, 0.8, 0.2, 1] }}
      className="font-spectral italic text-xl md:text-2xl lg:text-[26px] leading-[1.9] text-white/75 whitespace-pre-line"
      data-testid={`emotional-para-${index}`}
    >
      {text}
    </motion.p>
  );
}

export default function Emotional() {
  const { setDimension } = useContext(DimensionContext);
  const { scrollYProgress } = useScroll();
  const candleY = useTransform(scrollYProgress, [0, 1], ["0vh", "50vh"]);
  const candleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.95, 1], [0.3, 1, 1, 0.15]);

  const [candlelight, setCandlelight] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDimension("emotional");
    document.documentElement.style.setProperty("--grain-opacity", "0.08");
    ensureFirstVisit();
    markVisited("emotional");
    window.scrollTo(0, 0);
  }, [setDimension]);

  // Candlelight cursor tracking
  useEffect(() => {
    if (!candlelight) return;
    if (!overlayRef.current) return;

    overlayRef.current.style.setProperty("--cx", `${window.innerWidth / 2}px`);
    overlayRef.current.style.setProperty("--cy", `${window.innerHeight / 2}px`);

    const onMove = (e: MouseEvent) => {
      if (!overlayRef.current) return;
      overlayRef.current.style.setProperty("--cx", `${e.clientX}px`);
      overlayRef.current.style.setProperty("--cy", `${e.clientY}px`);
    };
    const onTouch = (e: TouchEvent) => {
      if (!overlayRef.current || !e.touches?.[0]) return;
      overlayRef.current.style.setProperty("--cx", `${e.touches[0].clientX}px`);
      overlayRef.current.style.setProperty("--cy", `${e.touches[0].clientY}px`);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [candlelight]);

  return (
    <main
      className={`emotional-bg min-h-screen relative letterbox overflow-hidden ${candlelight ? "candlelight-on" : ""}`}
      data-testid="emotional-page"
    >
      {/* Dynamic 3D Star Constellation Spiral Background */}
      <ThreeWorld type="emotional" candlelightActive={candlelight} />

      {/* Candle glow follows scroll */}
      <motion.div
        className="emotional-candle"
        style={{ y: candleY, opacity: candleOpacity }}
        aria-hidden="true"
      />

      {/* TOP BAR */}
      <div className={`${worldTopBarClass} text-white/30 relative z-10`} style={{ zIndex: 45 }}>
        <Link to="/" className="hover:text-white transition-colors flex items-center gap-2" data-testid="emotional-back-link">
          <ArrowLeft size={12} /> Gateway
        </Link>
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFB703]" style={{ boxShadow: "0 0 6px #FFB703" }} />
          03 / 03 · Emotional
        </span>
      </div>

      {/* HERO */}
      <section className="relative z-10 min-h-[90vh] flex flex-col justify-center items-center text-center px-6">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.2 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-[#FFB703]/50 mb-10"
        >
          {emotional.kicker}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(12px)", scale: 1.04 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 2.2, delay: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-playfair italic font-light text-[14vw] md:text-[9vw] lg:text-[7vw] leading-[1.05] text-white max-w-5xl"
          data-testid="emotional-heading"
        >
          A letter. <br/><em className="text-[#FFB703]" style={{ textShadow: "0 0 40px rgba(255,183,3,0.3)" }}>Unsigned.</em>
        </motion.h1>

        {/* Candlelight toggle */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.4 }}
          onClick={() => setCandlelight((v) => !v)}
          data-testid="candlelight-toggle"
          className="glass-pill mt-12 inline-flex items-center gap-3 px-5 py-2.5 text-[#FFB703] font-mono text-[11px] uppercase tracking-[0.25em] transition-all"
          style={{
            borderColor: "rgba(255,183,3,0.2)",
            boxShadow: candlelight ? "0 0 20px rgba(255,183,3,0.2)" : "none",
          }}
        >
          <Flame size={14} strokeWidth={1.5} />
          {candlelight ? "Lights on" : "Read by candlelight"}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.6 }}
          className="mt-12 font-mono text-[10px] uppercase tracking-[0.4em] text-white/20"
        >
          ↓  Scroll to unfold  ↓
        </motion.p>
      </section>

      {/* LETTER */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-14 md:space-y-20">
            {emotional.paragraphs.map((p, i) => (
              <Paragraph key={i} text={p} index={i} />
            ))}

            {/* Signature pause */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="flex items-center justify-center py-12"
              aria-hidden="true"
            >
              <div className="w-24 h-px bg-[#FFB703]/40" />
              <div
                className="mx-4 w-2 h-2 rounded-full bg-[#FFB703]"
                style={{ boxShadow: "0 0 24px #FFB703, 0 0 48px rgba(255,183,3,0.4)" }}
              />
              <div className="w-24 h-px bg-[#FFB703]/40" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
              className="font-playfair italic text-center text-3xl md:text-4xl text-[#FFB703]"
              style={{ textShadow: "0 0 30px rgba(255,183,3,0.2)" }}
              data-testid="emotional-signoff"
            >
              — Hemanth
            </motion.p>
          </div>
        </div>
      </section>

      {/* LEAVE A TRACE */}
      <LeaveATrace />

      {/* CANDLELIGHT OVERLAY */}
      {candlelight && (
        <div
          ref={overlayRef}
          aria-hidden
          data-testid="candlelight-overlay"
          className="fixed inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            zIndex: 50,
            background:
              "radial-gradient(circle 240px at var(--cx, 50%) var(--cy, 50%), rgba(3,5,12,0.04) 0px, rgba(3,5,12,0.5) 170px, rgba(3,5,12,0.94) 260px)",
          }}
        />
      )}
    </main>
  );
}
