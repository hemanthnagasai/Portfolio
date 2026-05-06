import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import { personal } from "@/data/portfolio";
import HandwrittenReveal from "@/components/HandwrittenReveal";
import useMagnetic from "@/hooks/useMagnetic";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 1, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

const hobbyAnnotations = ["fully.", "a philosophy.", "quiet.", "for wonder."];

function HobbyCard({ h, i }) {
  const ref = useMagnetic({ strength: 0.18, radius: 90 });
  return (
    <motion.article
      ref={ref}
      variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
      custom={i}
      className="personal-paper p-7 md:p-9 rounded-sm"
      data-testid={`personal-hobby-${i}`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#D4A373] mb-5">
        0{i + 1}
      </p>
      <h3 className="font-lora text-3xl mb-3 text-[#2C3E2D]">
        {h.title} <span className="caveat-annotation">· {hobbyAnnotations[i]}</span>
      </h3>
      <p className="font-lora text-base leading-[1.8] text-[#5C6A5D]">{h.note}</p>
    </motion.article>
  );
}

export default function Personal() {
  const { setDimension } = useContext(DimensionContext);
  useEffect(() => {
    setDimension("personal");
    document.documentElement.style.setProperty("--grain-opacity", "0.05");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main className="personal-bg min-h-screen relative" data-testid="personal-page">
      {/* TOP BAR */}
      <div className="flex justify-between items-center px-6 md:px-12 py-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#5C6A5D]">
        <Link to="/" className="hover:text-[#2C3E2D] transition-colors" data-testid="personal-back-link">
          <span className="inline-flex items-center gap-2"><ArrowLeft size={12} /> Gateway</span>
        </Link>
        <span>02 / 03 · Personal</span>
      </div>

      <div className="px-6 md:px-12 lg:px-20 pb-40 max-w-[1200px] mx-auto">
        {/* HERO */}
        <section className="pt-12 md:pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <motion.p
              variants={fadeUp} initial="hidden" animate="show" custom={0}
              className="font-mono text-xs uppercase tracking-[0.3em] text-[#D4A373] mb-6"
            >
              {personal.kicker}
            </motion.p>
            <h1 className="font-lora leading-[1] tracking-tight text-[13vw] md:text-[7vw] lg:text-[5.2vw] text-[#2C3E2D]" data-testid="personal-heading">
              <HandwrittenReveal
                words={["Warm.", "Deep.", "Human."]}
                delay={0.3}
                stagger={0.18}
                className="block"
              />
            </h1>
            <motion.blockquote
              variants={fadeUp} initial="hidden" animate="show" custom={5}
              className="mt-10 max-w-xl font-lora italic text-lg md:text-xl leading-relaxed text-[#5C6A5D]"
              data-testid="personal-quote"
            >
              “{personal.quote}”
            </motion.blockquote>
          </div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="lg:col-span-5 flex items-center justify-center"
          >
            <div className="personal-paper p-6 rotate-[-1.5deg] max-w-sm">
              <img
                alt="journal texture"
                src="https://images.unsplash.com/photo-1750003455625-f1f7ff927670?crop=entropy&cs=srgb&fm=jpg&w=600&q=85"
                className="w-full h-48 object-cover rounded-sm mb-4"
              />
              <p className="font-caveat text-[#D4A373] text-2xl leading-tight">
                from Mangalagiri, <br/>with quiet affection.
              </p>
            </div>
          </motion.div>
        </section>

        {/* BIO */}
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
          className="max-w-3xl font-lora text-lg md:text-xl leading-[1.85] text-[#2C3E2D]/85 mb-28"
          data-testid="personal-bio"
        >
          {personal.bio}
        </motion.p>

        {/* HOBBIES */}
        <section className="mb-28">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-lora text-3xl md:text-5xl text-[#2C3E2D]">
              Things that <em className="italic text-[#D4A373]">make me, me</em>
            </h2>
            <span className="caveat-annotation hidden md:inline">in no order —</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {personal.hobbies.map((h, i) => (
              <HobbyCard key={i} h={h} i={i} />
            ))}
          </div>
        </section>

        {/* VALUES */}
        <section className="mb-24">
          <h2 className="font-mono text-xs uppercase tracking-[0.35em] text-[#D4A373] mb-10">
            What I value
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personal.values.map((v, i) => (
              <motion.p
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                custom={i}
                className="font-lora text-2xl md:text-3xl text-[#2C3E2D] leading-snug border-t border-[#E8E3D9] pt-6"
                data-testid={`personal-value-${i}`}
              >
                <em className="italic">{v}</em>
              </motion.p>
            ))}
          </div>
        </section>

        {/* CLOSING */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4 }}
          className="max-w-4xl font-lora italic text-3xl md:text-5xl text-[#2C3E2D] leading-[1.25]"
          data-testid="personal-closing"
        >
          <span className="personal-underline pr-2">“{personal.closing}”</span>
        </motion.p>
      </div>
    </main>
  );
}
