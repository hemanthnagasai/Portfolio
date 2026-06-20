import { useContext, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, ArrowLeft, Briefcase, Code2, GraduationCap, Award, Cpu, ChevronDown, Zap, Layers, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { DimensionContext } from "@/context/DimensionContext";
import { professional } from "@/data/portfolio";
import Typewriter from "@/components/Typewriter";

import { markVisited, ensureFirstVisit } from "@/hooks/useUnlock";
import { worldContentClass, worldTopBarClass } from "@/constants/worldLayout";
import { cinematicReveal, fadeUp, staggerContainer } from "@/motion/presets";
import ThreeWorld from "@/components/ThreeWorld";

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || "";

/* ─── Section Label ─── */
interface SectionLabelProps {
  num: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SectionLabel({ num, icon, children }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-4 mb-12 relative z-10">
      <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.35em] text-[#00E5FF]">
        {icon}
        {num}
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.35em] text-white/40">
        {children}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#00E5FF]/20 to-transparent" />
    </div>
  );
}

/* ─── HUD Stat Panel ─── */
function HudPanel({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      className="prof-hero-hud p-5 md:p-6 flex-1 min-w-[140px]"
    >
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="text-[#00E5FF]/60">{icon}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">{label}</span>
      </div>
      <p className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight relative z-10">{value}</p>
    </motion.div>
  );
}

/* ─── Project Card with Spotlight ─── */
function ProjectCard({ p, i }: { p: typeof professional.projects[0]; i: number }) {
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  }, []);

  return (
    <motion.article
      ref={cardRef}
      variants={cinematicReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      custom={i}
      onMouseMove={handleMouseMove}
      className="prof-card prof-spotlight p-7 md:p-8 perspective-container group"
      data-testid={`prof-project-${i}`}
    >
      {/* Holographic shimmer overlay */}
      <div className="holo-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Header */}
      <div className="flex justify-between items-center mb-5 relative z-10">
        <p className="font-mono text-[10px] text-[#00E5FF]/70 uppercase tracking-[0.25em] whitespace-nowrap">
          [ Engine / 0{i + 1} ]
        </p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]/60 animate-pulse" />
          <span className="font-mono text-[8px] text-white/20 uppercase tracking-wider">Active</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-heading text-2xl md:text-3xl font-semibold mb-2 text-white tracking-tight relative z-10 group-hover:text-[#00E5FF] transition-colors duration-500">
        {p.name}
      </h3>

      {/* Stack pills */}
      <div className="flex flex-wrap gap-2 mb-5 relative z-10">
        {p.stack.split(" · ").map((tech, j) => (
          <span
            key={j}
            className="px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] rounded-full border border-[#00E5FF]/15 text-[#00E5FF]/70 bg-[#00E5FF]/05"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-white/50 font-spectral relative z-10 group-hover:text-white/65 transition-colors duration-500">
        {p.desc}
      </p>

      {/* Bottom accent line */}
      <div className="mt-6 h-[1px] bg-gradient-to-r from-[#00E5FF]/20 via-[#00E5FF]/10 to-transparent relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.article>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function Professional() {
  const { setDimension } = useContext(DimensionContext);

  useEffect(() => {
    setDimension("professional");
    document.documentElement.style.setProperty("--grain-opacity", "0.04");
    ensureFirstVisit();
    markVisited("professional");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main className="prof-bg min-h-screen text-[#E2E8F0] relative overflow-hidden" data-testid="professional-page">
      {/* Dynamic 3D Scroll-Driven World (Data Sky Highway) */}
      <ThreeWorld type="professional" />

      {/* TOP BAR */}
      <div className={`${worldTopBarClass} text-white/30 relative z-10`}>
        <Link to="/" className="hover:text-white transition-colors flex items-center gap-2" data-testid="prof-back-link">
          <ArrowLeft size={12} /> Gateway
        </Link>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" style={{ boxShadow: "0 0 8px #00E5FF" }} />
          01 / 03 · Professional
        </span>
      </div>

      <div className={`${worldContentClass} relative z-10`}>

        {/* ════════════════════════════════════════════
            WING I: IMMERSIVE HERO SECTION
            ════════════════════════════════════════════ */}
        <section className="pt-12 md:pt-24 pb-16 perspective-container min-h-[85vh] flex flex-col justify-center relative">
          {/* Volumetric background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-0"
            style={{
              background: "radial-gradient(circle, rgba(0, 229, 255,0.06) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Kicker */}
          <motion.p
            variants={cinematicReveal} initial="hidden" animate="show" custom={0}
            className="font-mono text-xs uppercase tracking-[0.3em] text-[#00E5FF]/80 mb-6 relative z-10"
          >
            {professional.kicker}
          </motion.p>

          {/* Main heading */}
          <h1 className="font-display font-bold leading-[0.95] tracking-tight text-[12vw] md:text-[7vw] lg:text-[5.5vw] relative z-10" data-testid="prof-heading">
            <span className="font-spectral italic font-light text-white/40 block text-xs md:text-sm uppercase tracking-[0.35em] mb-4">
              Professional · Overview
            </span>
            <Typewriter
              text="Data. Clarity. Systems."
              speed={55}
              delay={350}
              cursorClass="bg-[#00E5FF]"
              className="text-white [&>span]:text-[#00E5FF]"
              testId="prof-heading-tw"
            />
          </h1>

          {/* Quote */}
          <motion.blockquote
            variants={cinematicReveal} initial="hidden" animate="show" custom={4}
            className="mt-12 max-w-2xl font-spectral italic text-lg md:text-xl leading-relaxed text-white/50 border-l-2 border-[#00E5FF]/40 pl-6 relative z-10"
            data-testid="prof-quote"
          >
            "{professional.quote}"
          </motion.blockquote>

          {/* Bio */}
          <motion.p
            variants={cinematicReveal} initial="hidden" animate="show" custom={5}
            className="mt-10 max-w-3xl font-mono text-xs md:text-sm leading-[1.95] text-white/45 relative z-10"
          >
            {professional.bio}
          </motion.p>

          {/* HUD Stat Panels */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mt-14 flex flex-wrap gap-4 relative z-10"
          >
            <HudPanel label="Experience" value="1+ Year" icon={<Zap size={12} strokeWidth={1.5} />} />
            <HudPanel label="Tools & Langs" value="13+" icon={<Layers size={12} strokeWidth={1.5} />} />
            <HudPanel label="Projects" value={`${professional.projects.length}`} icon={<Target size={12} strokeWidth={1.5} />} />
            <HudPanel label="Certifications" value={`${professional.certs.length}`} icon={<Award size={12} strokeWidth={1.5} />} />
          </motion.div>

          {/* Download CTA */}
          <motion.div
            variants={cinematicReveal} initial="hidden" animate="show" custom={7}
            className="relative z-10"
          >
            <a
              href={`${BACKEND_URL}/api/resume/download`}
              target="_blank" rel="noopener noreferrer"
              data-testid="download-resume-btn"
              className="glass-pill inline-flex items-center gap-3 mt-12 px-6 py-3 text-[#00E5FF] font-mono text-xs uppercase tracking-[0.25em] hover:bg-[#00E5FF]/10 transition-all rounded-sm"
              style={{
                borderColor: "rgba(0, 229, 255,0.3)",
                boxShadow: "0 0 20px -4px rgba(0, 229, 255,0.15)",
              }}
            >
              <Download size={14} strokeWidth={1.4} /> Download Resume (PDF)
            </a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          >
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/20">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown size={14} className="text-[#00E5FF]/40" />
            </motion.div>
          </motion.div>
        </section>

        <div className="section-divider" />

        {/* ════════════════════════════════════════════
            WING II: 3D FILM-REEL EXPERIENCE TIMELINE
            ════════════════════════════════════════════ */}
        <section className="py-16">
          <SectionLabel num="01" icon={<Briefcase size={12} strokeWidth={1.4} />}>Experience</SectionLabel>

          {professional.experience.map((e, i) => (
            <motion.div
              key={i}
              variants={cinematicReveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              custom={i}
              className="prof-reel-card p-8 md:p-10 mb-8 perspective-container"
              data-testid={`prof-experience-${i}`}
            >
              {/* Sprocket holes top */}
              <div className="absolute top-0 left-0 right-0 h-4 flex gap-5 px-6 items-center pointer-events-none z-20">
                {Array.from({ length: 20 }).map((_, k) => (
                  <div key={k} className="w-2.5 h-1.5 rounded-[1px] bg-white/[0.03] border border-white/[0.04] flex-shrink-0" />
                ))}
              </div>

              {/* Film metadata badge */}
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#00E5FF]/40">0{i + 1}</span>
                <div className="flex-1 h-px bg-white/5" />
                <span className="font-mono text-[8px] text-white/20">▶ {e.period}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 relative z-10">
                <div className="lg:col-span-4">
                  <p className="font-heading text-xl md:text-2xl font-semibold text-white tracking-tight">{e.company}</p>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00E5FF]/80 mt-2">{e.role}</p>
                  <p className="font-mono text-xs text-white/30 mt-3">{e.period}</p>
                  {e.sub && <p className="font-mono text-[10px] text-white/25 mt-1">{e.sub}</p>}
                </div>
                <ul className="lg:col-span-8 space-y-4">
                  {e.bullets.map((b, j) => (
                    <motion.li
                      key={j}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      custom={j * 0.1}
                      className="flex gap-4 font-mono text-xs md:text-sm leading-relaxed text-white/55"
                    >
                      <span className="mt-[6px] w-2 h-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 flex items-center justify-center shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#00E5FF]" />
                      </span>
                      {b}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Sprocket holes bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-4 flex gap-5 px-6 items-center pointer-events-none z-20">
                {Array.from({ length: 20 }).map((_, k) => (
                  <div key={k} className="w-2.5 h-1.5 rounded-[1px] bg-white/[0.03] border border-white/[0.04] flex-shrink-0" />
                ))}
              </div>

              {/* Projector burn right edge */}
              <div
                className="absolute right-0 top-0 bottom-0 w-3 opacity-0 hover:opacity-30 transition-opacity duration-700 pointer-events-none z-0"
                style={{
                  background: "linear-gradient(270deg, rgba(0, 229, 255,0.3), transparent)",
                  filter: "blur(2px)",
                }}
              />
            </motion.div>
          ))}
        </section>

        <div className="section-divider" />

        {/* ════════════════════════════════════════════
            WING III: INTERACTIVE PROJECT SHOWCASE
            ════════════════════════════════════════════ */}
        <section className="py-16">
          <SectionLabel num="02" icon={<Code2 size={12} strokeWidth={1.4} />}>Projects</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-container">
            {professional.projects.map((p, i) => (
              <ProjectCard key={i} p={p} i={i} />
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* ════════════════════════════════════════════
            WING IV: EDUCATION — GLOWING VERTICAL TIMELINE
            ════════════════════════════════════════════ */}
        <section className="py-16">
          <SectionLabel num="03" icon={<GraduationCap size={12} strokeWidth={1.4} />}>Education</SectionLabel>

          <div className="relative pl-12 md:pl-14">
            {/* Glowing spine */}
            <div className="edu-timeline-spine" />

            {professional.education.map((e, i) => (
              <motion.div
                key={i}
                variants={cinematicReveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                custom={i}
                className="relative mb-10 group"
                data-testid={`prof-education-${i}`}
              >
                {/* Timeline node */}
                <div className="absolute -left-[42px] md:-left-[46px] top-6">
                  <div className="edu-timeline-node group-hover:scale-110 transition-transform" />
                </div>

                {/* Horizontal connector */}
                <div className="absolute -left-[20px] md:-left-[24px] top-[31px] w-[20px] md:w-[24px] h-[1px] bg-gradient-to-r from-[#00E5FF]/30 to-[#00E5FF]/10" />

                {/* Card */}
                <div className="prof-card p-6 md:p-8 group-hover:border-[#00E5FF]/30 transition-colors duration-500">
                  <div className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-12 md:col-span-6">
                      <p className="font-heading text-lg md:text-xl font-medium text-white tracking-tight group-hover:text-[#00E5FF] transition-colors duration-500">
                        {e.degree}
                      </p>
                      <p className="font-mono text-xs text-white/45 mt-1">{e.org}</p>
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider">{e.period}</p>
                    </div>
                    <div className="col-span-6 md:col-span-3 text-right md:text-left">
                      <span className="inline-block px-3 py-1 font-mono text-xs text-[#00E5FF] font-semibold rounded-md border border-[#00E5FF]/20 bg-[#00E5FF]/05 group-hover:bg-[#00E5FF]/10 group-hover:border-[#00E5FF]/40 transition-all duration-500">
                        {e.meta}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* ════════════════════════════════════════════
            WING V: ORBITAL SKILL CONSTELLATION
            ════════════════════════════════════════════ */}
        <section className="py-16">
          <SectionLabel num="04" icon={<Cpu size={12} strokeWidth={1.4} />}>Skills</SectionLabel>
          <div className="flex flex-wrap gap-3 perspective-container">
            {professional.skills.map((s, i) => (
              <motion.span
                key={s}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
                custom={i * 0.08}
                className="prof-chip px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] cursor-default"
                data-testid={`prof-skill-${i}`}
              >
                {s}
              </motion.span>
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* ════════════════════════════════════════════
            WING VI: CERTIFICATION AWARD SHELF
            ════════════════════════════════════════════ */}
        <section className="py-16">
          <SectionLabel num="05" icon={<Award size={12} strokeWidth={1.4} />}>Certifications</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
            {professional.certs.map((c, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                custom={i}
                className="cert-shelf-item flex justify-between items-center border-b border-white/5 py-4 group"
                data-testid={`prof-cert-${i}`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-1 h-1 rounded-full bg-[#00E5FF]/40 group-hover:bg-[#00E5FF] transition-colors duration-300" />
                  <p className="font-heading text-[13px] text-white/70 group-hover:text-white transition-colors duration-300">{c.name}</p>
                </div>
                <p className="font-mono text-[10px] text-[#00E5FF]/60 uppercase tracking-[0.15em] font-semibold relative z-10 group-hover:text-[#00E5FF] transition-colors duration-300">
                  {c.org}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
