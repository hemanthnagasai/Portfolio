import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import { personal } from "@/data/portfolio";
import HandwrittenReveal from "@/components/HandwrittenReveal";
import { markVisited, ensureFirstVisit } from "@/hooks/useUnlock";
import { worldContentClass, worldTopBarClass } from "@/constants/worldLayout";
import ThreeWorld from "@/components/ThreeWorld";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] as const },
  }),
};

const hobbyAnnotations = ["fully.", "a philosophy.", "quiet.", "for wonder."];

interface Hobby {
  title: string;
  note: string;
}

interface HobbyCardProps {
  h: Hobby;
  i: number;
}

function HobbyCard({ h, i }: HobbyCardProps) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      custom={i}
      className="p-8 rounded-lg bg-[#131b14]/55 border border-[#2a382c]/55 backdrop-blur-md transition-all duration-500 hover:border-[#d4a373]/35 hover:bg-[#18211a]/85 group relative overflow-hidden shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] animate-float-gentle"
      style={{ animationDelay: `${i * 0.5}s` }}
      data-testid={`personal-hobby-${i}`}
    >
      {/* Warm shimmer effect */}
      <div className="personal-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="font-caveat text-2xl text-[#D4A373]/90 font-bold select-none">
          0{i + 1} ·
        </p>
        <span className="caveat-annotation text-[#D4A373]/70 text-[15px] select-none">
          {hobbyAnnotations[i]}
        </span>
      </div>

      <h3 className="font-lora text-2xl font-medium mb-3 text-[#FAF5EC] group-hover:text-white transition-colors duration-300 relative z-10">
        {h.title}
      </h3>

      <p className="font-lora text-sm md:text-[15px] leading-[1.8] text-[#BFCBC2] group-hover:text-[#FAF5EC] transition-colors duration-500 relative z-10">
        {h.note}
      </p>
    </motion.article>
  );
}

export default function Personal() {
  const { setDimension } = useContext(DimensionContext);
  useEffect(() => {
    setDimension("personal");
    document.documentElement.style.setProperty("--grain-opacity", "0.05");
    ensureFirstVisit();
    markVisited("personal");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main className="personal-bg min-h-screen relative overflow-hidden pb-32" data-testid="personal-page">
      {/* Dynamic 3D Scroll-Driven World (Warm Memory Path) */}
      <ThreeWorld type="personal" />

      {/* TOP BAR */}
      <div className={`${worldTopBarClass} text-[#A7B5A6] relative z-20`}>
        <Link to="/" className="hover:text-[#FAF5EC] transition-colors flex items-center gap-2" data-testid="personal-back-link">
          <ArrowLeft size={12} /> Gateway
        </Link>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
          <Heart size={10} className="text-[#D4A373] animate-pulse" />
          02 / 03 · Personal
        </span>
      </div>

      <div className={`${worldContentClass} relative z-10`}>

        {/* Volumetric background glow behind title */}
        <div
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(212, 163, 115, 0.04) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* HERO */}
        <section className="pt-12 md:pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7">
            <motion.p
              variants={fadeUp} initial="hidden" animate="show" custom={0}
              className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A373] mb-6"
            >
              {personal.kicker}
            </motion.p>

            <h1 className="font-lora leading-[1.1] tracking-tight text-[11vw] md:text-[6vw] lg:text-[4.8vw] text-[#FAF5EC]" data-testid="personal-heading">
              <HandwrittenReveal
                words={["Warm.", "Deep.", "Human."]}
                delay={0.3}
                stagger={0.18}
                className="block"
              />
            </h1>

            <motion.blockquote
              variants={fadeUp} initial="hidden" animate="show" custom={4}
              className="mt-10 max-w-xl font-lora italic text-lg md:text-xl leading-relaxed text-[#BFCBC2] relative"
              data-testid="personal-quote"
            >
              <span className="text-[#D4A373]/20 font-serif text-6xl absolute -left-6 -top-5 select-none">“</span>
              {personal.quote}
              <span className="text-[#D4A373]/20 font-serif text-6xl absolute -right-6 -bottom-10 select-none">”</span>
            </motion.blockquote>
          </div>

          {/* Polaroid Memory Photo */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="lg:col-span-5 flex items-center justify-center"
          >
            <div className="bg-[#fcfaf7] p-5 pb-9 rotate-[-2deg] max-w-sm hover:rotate-0 hover:scale-[1.03] transition-all duration-500 ease-out cursor-pointer shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-[#ebdcb9]/35 rounded-sm relative group">
              {/* Semi-transparent tape style decoration */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-white/10 backdrop-blur-[1px] border border-white/15 rotate-[1.5deg] opacity-65 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ clipPath: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)" }} />

              <div className="overflow-hidden bg-[#1a1715] aspect-[4/5] rounded-sm mb-5 relative">
                <img
                  alt="Hemanth Avatar"
                  src="/avatar.jpeg"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1750003455625-f1f7ff927670?crop=entropy&cs=srgb&fm=jpg&w=600&q=85";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              </div>

              <p className="font-caveat text-[#2f2519] text-2.5xl leading-none mt-2 text-center font-bold tracking-tight select-none">
                from Mangalagiri, <br />with quiet affection.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Volumetric backdrop behind Bio */}
        <div
          className="absolute top-[40%] right-[10%] w-[600px] h-[500px] pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(139, 154, 140, 0.03) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* BIO */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
          className="max-w-3xl border-l-2 border-[#D4A373]/30 pl-6 md:pl-8 mb-28 relative z-10"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#D4A373] mb-4">The Journey</p>
          <p className="font-lora text-xl md:text-2xl leading-[1.85] text-[#D7E1D9]" data-testid="personal-bio">
            {personal.bio}
          </p>
        </motion.div>

        {/* HOBBIES */}
        <section className="mb-28 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <h2 className="font-lora text-3xl md:text-5xl text-[#FAF5EC]">
              Things that <em className="italic text-[#D4A373]">make me, me</em>
            </h2>
            <span className="caveat-annotation text-lg hidden md:inline">in no order —</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personal.hobbies.map((h, i) => (
              <HobbyCard key={i} h={h} i={i} />
            ))}
          </div>
        </section>

        {/* VALUES */}
        <section className="mb-28 relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <Sparkles size={14} className="text-[#D4A373] animate-pulse" />
            <h2 className="font-mono text-xs uppercase tracking-[0.35em] text-[#D4A373]">
              What I value
            </h2>
          </div>

          <div className="relative pl-8 md:pl-10 max-w-3xl">
            {/* Spine line connecting timeline nodes */}
            <div className="absolute left-3.5 md:left-4 top-2 bottom-2 w-[1px] bg-gradient-to-b from-[#d4a373]/40 via-[#d4a373]/15 to-transparent" />

            <div className="space-y-12">
              {personal.values.map((v, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                  custom={i}
                  className="relative group flex flex-col md:flex-row md:items-start gap-4"
                  data-testid={`personal-value-${i}`}
                >
                  {/* Glowing timeline node */}
                  <div className="absolute -left-[30px] md:-left-[32px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#d4a373]/35 bg-[#090d0a] flex items-center justify-center z-10 group-hover:border-[#d4a373] group-hover:scale-110 transition-all duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4a373] opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex-1">
                    <span className="font-mono text-[9px] text-[#D4A373]/70 uppercase tracking-[0.2em] block mb-1">
                      Value 0{i + 1} //
                    </span>
                    <p className="font-lora italic text-xl md:text-2.5xl text-[#e5ded4] group-hover:text-white transition-colors duration-300 leading-snug">
                      {v}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4 }}
          className="max-w-4xl mx-auto py-16 border-t border-[#2A332A]/50 text-center relative z-10"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#D4A373] mb-6">Final thought</p>

          <blockquote className="font-lora italic text-2xl md:text-4xl text-[#FAF5EC] leading-relaxed relative max-w-2xl mx-auto" data-testid="personal-closing">
            <span className="text-[#D4A373]/10 font-serif text-8xl absolute -left-10 -top-12 select-none pointer-events-none">“</span>
            <span className="personal-underline px-1">“{personal.closing}”</span>
            <span className="text-[#D4A373]/10 font-serif text-8xl absolute -right-10 -bottom-16 select-none pointer-events-none">”</span>
          </blockquote>
        </motion.section>
      </div>
    </main>
  );
}
