import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { DimensionContext } from "@/context/DimensionContext";
import { professional } from "@/data/portfolio";
import Typewriter from "@/components/Typewriter";
import useMagnetic from "@/hooks/useMagnetic";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

function SectionLabel({ num, children }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#00E5FF]">
        {num}
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.35em] text-white/60">
        {children}
      </span>
      <div className="flex-1 bar-line text-white" />
    </div>
  );
}

export default function Professional() {
  const { setDimension } = useContext(DimensionContext);
  const dlRef = useMagnetic({ strength: 0.35, radius: 100 });
  useEffect(() => {
    setDimension("professional");
    document.documentElement.style.setProperty("--grain-opacity", "0.07");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main className="prof-bg min-h-screen text-[#E2E8F0] relative" data-testid="professional-page">
      <div className="prof-grid-lines absolute inset-0 pointer-events-none opacity-60" />

      {/* TOP BAR */}
      <div className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40">
        <Link to="/" className="hover:text-white transition-colors" data-testid="prof-back-link">
          <span className="inline-flex items-center gap-2"><ArrowLeft size={12} /> Gateway</span>
        </Link>
        <span>01 / 03 · Professional</span>
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-20 pb-40 max-w-[1400px] mx-auto">
        {/* HERO */}
        <section className="pt-12 md:pt-24 pb-24">
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="font-mono text-xs uppercase tracking-[0.3em] text-[#00E5FF] mb-6"
          >
            {professional.kicker}
          </motion.p>
          <h1 className="font-outfit font-bold leading-[0.95] tracking-tight text-[12vw] md:text-[7vw] lg:text-[5.5vw] text-[#00E5FF]" data-testid="prof-heading">
            <Typewriter
              text="Data. Clarity. Initiative."
              speed={55}
              delay={350}
              cursorClass="bg-[#00E5FF]"
              className="text-white [&>span]:text-[#00E5FF]"
              testId="prof-heading-tw"
            />
          </h1>
          <motion.blockquote
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="mt-12 max-w-2xl font-spectral italic text-lg md:text-xl leading-relaxed text-white/70 border-l-2 border-[#00E5FF]/60 pl-6"
            data-testid="prof-quote"
          >
            “{professional.quote}”
          </motion.blockquote>
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="mt-10 max-w-3xl font-mono text-sm md:text-[15px] leading-[1.9] text-white/60"
          >
            {professional.bio}
          </motion.p>

          <motion.a
            variants={fadeUp} initial="hidden" animate="show" custom={6}
            ref={dlRef}
            href={`${BACKEND_URL}/api/resume/download`}
            target="_blank" rel="noopener noreferrer"
            data-testid="download-resume-btn"
            className="inline-flex items-center gap-3 mt-12 px-6 py-3 border border-[#00E5FF] text-[#00E5FF] font-mono text-xs uppercase tracking-[0.25em] hover:bg-[#00E5FF] hover:text-[#0A0B0E] transition-colors"
          >
            <Download size={14} strokeWidth={1.4} /> Download Resume (PDF)
          </motion.a>
        </section>

        {/* EXPERIENCE */}
        <section className="py-16">
          <SectionLabel num="01">Experience</SectionLabel>
          {professional.experience.map((e, i) => (
            <motion.div
              key={i}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10"
              data-testid={`prof-experience-${i}`}
            >
              <div className="lg:col-span-4">
                <p className="font-outfit text-xl font-semibold">{e.company}</p>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 mt-2">{e.role}</p>
                <p className="font-mono text-xs text-[#00E5FF]/80 mt-3">{e.period}</p>
                {e.sub && <p className="font-mono text-[11px] text-white/40 mt-1">{e.sub}</p>}
              </div>
              <ul className="lg:col-span-8 space-y-3">
                {e.bullets.map((b, j) => (
                  <li key={j} className="flex gap-3 font-mono text-sm leading-relaxed text-white/70">
                    <span className="text-[#00E5FF] mt-[7px] w-3 h-px bg-[#00E5FF] shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </section>

        {/* PROJECTS */}
        <section className="py-16">
          <SectionLabel num="02">Projects</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {professional.projects.map((p, i) => (
              <motion.article
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
                custom={i}
                className="prof-card p-7 rounded-sm"
                data-testid={`prof-project-${i}`}
              >
                <p className="font-mono text-[11px] text-[#00E5FF] uppercase tracking-[0.25em] mb-4">
                  [ Project / {String(i + 1).padStart(2, "0")} ]
                </p>
                <h3 className="font-outfit text-2xl font-semibold mb-2">{p.name}</h3>
                <p className="font-mono text-xs text-white/50 mb-5 uppercase tracking-[0.15em]">{p.stack}</p>
                <p className="text-sm leading-relaxed text-white/70 font-spectral">{p.desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* EDUCATION */}
        <section className="py-16">
          <SectionLabel num="03">Education</SectionLabel>
          <div className="divide-y divide-white/10">
            {professional.education.map((e, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
                custom={i}
                className="grid grid-cols-12 gap-4 py-6 items-baseline"
                data-testid={`prof-education-${i}`}
              >
                <p className="col-span-12 md:col-span-5 font-outfit text-lg font-medium">{e.degree}</p>
                <p className="col-span-6 md:col-span-3 font-mono text-sm text-white/60">{e.org}</p>
                <p className="col-span-3 md:col-span-2 font-mono text-xs text-white/40">{e.period}</p>
                <p className="col-span-3 md:col-span-2 font-mono text-xs text-[#00E5FF] text-right md:text-left">{e.meta}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        <section className="py-16">
          <SectionLabel num="04">Skills</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {professional.skills.map((s, i) => (
              <motion.span
                key={s}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
                custom={i * 0.3}
                className="prof-chip px-4 py-2 rounded-full font-mono text-xs uppercase tracking-[0.15em]"
                data-testid={`prof-skill-${i}`}
              >
                {s}
              </motion.span>
            ))}
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="py-16">
          <SectionLabel num="05">Certifications &amp; Achievements</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            {professional.certs.map((c, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
                custom={i}
                className="flex justify-between border-b border-white/10 pb-3"
                data-testid={`prof-cert-${i}`}
              >
                <p className="font-outfit text-sm">{c.name}</p>
                <p className="font-mono text-xs text-white/50 uppercase tracking-[0.15em]">{c.org}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
