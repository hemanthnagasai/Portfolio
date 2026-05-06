import { useContext, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import { emotional } from "@/data/portfolio";

function Paragraph({ text, index }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="font-spectral italic text-xl md:text-2xl lg:text-[26px] leading-[1.9] text-white/85 whitespace-pre-line"
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
  const candleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.95, 1], [0.4, 1, 1, 0.2]);

  useEffect(() => {
    setDimension("emotional");
    document.documentElement.style.setProperty("--grain-opacity", "0.09");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main className="emotional-bg min-h-screen relative" data-testid="emotional-page">
      {/* candle glow follows scroll */}
      <motion.div
        className="emotional-candle"
        style={{ y: candleY, opacity: candleOpacity }}
        aria-hidden="true"
      />

      {/* TOP BAR */}
      <div className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40">
        <Link to="/" className="hover:text-white transition-colors" data-testid="emotional-back-link">
          <span className="inline-flex items-center gap-2"><ArrowLeft size={12} /> Gateway</span>
        </Link>
        <span>03 / 03 · Emotional</span>
      </div>

      {/* HERO */}
      <section className="relative z-10 min-h-[90vh] flex flex-col justify-center items-center text-center px-6">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.2 }}
          className="font-mono text-xs uppercase tracking-[0.35em] text-[#FFB703]/80 mb-10"
        >
          {emotional.kicker}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 2, delay: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-playfair italic font-light text-[14vw] md:text-[9vw] lg:text-[7vw] leading-[1.05] text-white max-w-5xl"
          data-testid="emotional-heading"
        >
          A letter. <br/><em className="text-[#FFB703]">Unsigned.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.6 }}
          className="mt-16 font-mono text-[10px] uppercase tracking-[0.4em] text-white/35"
        >
          ↓  Scroll to unfold  ↓
        </motion.p>
      </section>

      {/* LETTER */}
      <section className="relative z-10 px-6 md:px-10 max-w-2xl mx-auto py-24 md:py-40">
        <div className="space-y-24 md:space-y-40">
          {emotional.paragraphs.map((p, i) => (
            <Paragraph key={i} text={p} index={i} />
          ))}

          {/* Signature pause */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="flex items-center justify-center py-20"
            aria-hidden="true"
          >
            <div className="w-24 h-px bg-[#FFB703]/60" />
            <div className="mx-4 w-2 h-2 rounded-full bg-[#FFB703] shadow-[0_0_24px_#FFB703]" />
            <div className="w-24 h-px bg-[#FFB703]/60" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="font-playfair italic text-center text-3xl md:text-4xl text-[#FFB703]"
            data-testid="emotional-signoff"
          >
            — H.
          </motion.p>
        </div>
      </section>
    </main>
  );
}
