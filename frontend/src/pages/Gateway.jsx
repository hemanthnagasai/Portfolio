import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { DimensionContext } from "@/context/DimensionContext";
import { TransitionContext } from "@/context/TransitionContext";
import { profile } from "@/data/portfolio";
import { ArrowUpRight } from "lucide-react";
import useMagnetic from "@/hooks/useMagnetic";

const portals = [
  {
    num: "01",
    name: "Professional",
    verb: "Build",
    desc: "The analyst · The builder",
    to: "/professional",
    accent: "#00E5FF",
    flash: "#0A0B0E",
  },
  {
    num: "02",
    name: "Personal",
    verb: "Live",
    desc: "The human · The friend",
    to: "/personal",
    accent: "#D4A373",
    flash: "#FDFBF7",
  },
  {
    num: "03",
    name: "Emotional",
    verb: "Feel",
    desc: "The heart · The letter",
    to: "/emotional",
    accent: "#FFB703",
    flash: "#070913",
  },
];

function Portal({ p, i, onPick }) {
  const ref = useMagnetic({ strength: 0.18, radius: 120 });
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.3 + i * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <button
        ref={ref}
        type="button"
        onClick={(e) => onPick(e, p)}
        data-testid={`portal-${p.name.toLowerCase()}`}
        className="portal-card group block p-7 md:p-9 rounded-sm h-full w-full text-left"
      >
        <div className="flex justify-between items-start mb-14 md:mb-20">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            {p.num} · {p.name}
          </span>
          <motion.span
            className="text-white/50 group-hover:text-white transition-colors"
            initial={{ x: 0, y: 0 }}
            whileHover={{ x: 4, y: -4 }}
          >
            <ArrowUpRight size={18} strokeWidth={1.2} />
          </motion.span>
        </div>
        <div>
          <h3 className="font-cormorant font-light text-5xl md:text-6xl mb-2 text-white">
            <span className="group-hover:hidden">{p.verb}</span>
            <span
              className="hidden group-hover:inline italic"
              style={{ color: p.accent }}
            >
              {p.verb}.
            </span>
          </h3>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">
            {p.desc}
          </p>
        </div>
      </button>
    </motion.div>
  );
}

export default function Gateway() {
  const { setDimension } = useContext(DimensionContext);
  const { trigger } = useContext(TransitionContext);
  const avatarRef = useMagnetic({ strength: 0.12, radius: 200 });

  useEffect(() => {
    setDimension("gateway");
    document.documentElement.style.setProperty("--grain-opacity", "0.08");
  }, [setDimension]);

  const handlePick = (e, p) => {
    const rect = e.currentTarget.getBoundingClientRect();
    trigger({ rect, color: p.flash, to: p.to });
  };

  const handleRecruiterPick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    trigger({ rect, color: "#FFFFFF", to: "/recruiter" });
  };

  return (
    <main className="gateway-bg min-h-screen relative overflow-hidden" data-testid="gateway-page">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 md:px-12 py-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40"
      >
        <span>Life Portfolio · 2026</span>
        <span>Hemanth Naga Sai Chakka</span>
      </motion.div>

      <div className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-28 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20 lg:mb-28">
          {/* Avatar with magnetic + breathing */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-5 flex justify-center lg:justify-start"
          >
            <motion.div
              ref={avatarRef}
              animate={{ scale: [1, 1.012, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-56 h-72 md:w-72 md:h-96 rounded-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 z-10" />
              <img
                alt="Hemanth digital avatar"
                src="https://customer-assets.emergentagent.com/job_dimension-journey/artifacts/xp16cgna_AI%20avatar.jpeg"
                className="w-full h-full object-cover contrast-105"
                data-testid="gateway-avatar"
              />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-[10px] font-mono uppercase tracking-[0.25em] text-white/70 z-20">
                <span>A—01</span>
                <span>Reveal / Layered</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Heading */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-white/50 mb-6"
              data-testid="gateway-kicker"
            >
              Choose a world to enter — each is a different side of the same person
            </motion.p>

            <h1 className="font-cormorant font-light leading-[0.9] tracking-tight text-[15vw] md:text-[10vw] lg:text-[7.2vw] text-white">
              {[profile.firstName, profile.middleName].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.55 + i * 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                  className="block"
                  data-testid={`gateway-name-${i}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.1 }}
              className="mt-8 max-w-xl text-base md:text-lg text-white/60 font-spectral italic leading-relaxed"
              data-testid="gateway-tagline"
            >
              {profile.tagline}
            </motion.p>
          </div>
        </div>

        {/* PORTALS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {portals.map((p, i) => (
            <Portal key={p.num} p={p} i={i} onPick={handlePick} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 2 }}
          className="mt-20 flex justify-between items-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/30"
        >
          <span>Scroll · Click · Linger</span>
          <button
            onClick={handleRecruiterPick}
            className="hover:text-white/80 transition-colors"
            data-testid="gateway-recruiter-link"
          >
            Recruiter view →
          </button>
        </motion.div>
      </div>
    </main>
  );
}
