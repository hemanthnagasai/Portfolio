import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";
import portfolioData from "@/data/portfolio.json";

const now = portfolioData.now;

// A "/now" page (nownownow.com): what I'm focused on right now, edited in
// portfolio.json — which also grounds the chatbot, so the AI me stays
// current for free.
export default function Now() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Now — Hemanth Naga Sai Chakka",
    "What Hemanth is focused on right now — work, learning, and the constants.",
  );

  useEffect(() => {
    setDimension("gateway");
    document.documentElement.style.setProperty("--grain-opacity", "0.04");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main
      className="min-h-screen relative"
      style={{ background: "var(--bg-void)", color: "#f0f0f5" }}
      data-testid="now-page"
    >
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-16 relative">
        <div className="flex justify-between items-center mb-14 font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:text-white/60 transition-colors"
            data-testid="now-back-link"
          >
            <ArrowLeft size={11} /> Gateway
          </Link>
          <span>Updated {now.updated}</span>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-playfair text-5xl md:text-6xl text-[#f5f2ff]">Now</h1>
          <p className="font-spectral italic text-lg text-white/45 mt-4 leading-relaxed max-w-[60ch]">
            {now.intro}
          </p>
        </motion.header>

        <section className="mt-14 space-y-10">
          {now.items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: "easeOut" }}
              className="border-l border-white/10 pl-6"
              data-testid={`now-item-${i}`}
            >
              <h2 className="font-heading text-lg text-white/90 tracking-tight">{item.title}</h2>
              <p className="font-spectral text-[15px] leading-[1.8] text-white/50 mt-2 max-w-[62ch]">
                {item.note}
              </p>
            </motion.article>
          ))}
        </section>

        <footer className="mt-20 pt-8 border-t border-white/5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/20 flex gap-6 flex-wrap">
          <Link to="/how-i-built-this" className="hover:text-white/50 transition-colors">
            How this site was built →
          </Link>
          <Link to="/query" className="hover:text-white/50 transition-colors">
            Query my data →
          </Link>
        </footer>
      </div>
    </main>
  );
}
