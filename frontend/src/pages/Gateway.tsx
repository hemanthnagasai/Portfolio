import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DimensionContext } from "@/context/DimensionContext";
import { TransitionContext } from "@/context/TransitionContext";
import { profile } from "@/data/portfolio";
import { ArrowUpRight, Sparkles } from "lucide-react";
import useMagnetic from "@/hooks/useMagnetic";
import LivingPortrait from "@/components/LivingPortrait";
import { getGreeting, SUBLINE } from "@/utils/greeting";
import useUnlock, { ensureFirstVisit } from "@/hooks/useUnlock";
import { cinematicReveal, filmFrameEnter } from "@/motion/presets";

interface PortalInfo {
  num: string;
  name: string;
  verb: string;
  desc: string;
  to: string;
  accent: string;
  flash: string;
  timecode: string;
}

const portals: PortalInfo[] = [
  {
    num: "01",
    name: "Professional",
    verb: "Build",
    desc: "The analyst · The builder",
    to: "/professional",
    accent: "#00E5FF",
    flash: "#0A0B0E",
    timecode: "01:00:00:01",
  },
  {
    num: "02",
    name: "Personal",
    verb: "Live",
    desc: "The human · The friend",
    to: "/personal",
    accent: "#FFB703",
    flash: "#0a0906",
    timecode: "02:00:00:01",
  },
  {
    num: "03",
    name: "Emotional",
    verb: "Feel",
    desc: "The heart · The letter",
    to: "/emotional",
    accent: "#FFB703",
    flash: "#050711",
    timecode: "03:00:00:01",
  },
];

const milestones = [
  { year: "2019", label: "Class X · 9.50 GPA" },
  { year: "2021", label: "Intermediate · 87.8%" },
  { year: "2025", label: "B.Tech · KITS" },
  { year: "2025", label: "EY · Intern" },
  { year: "2026", label: "EY · Senior Data Analyst" },
];

interface PortalProps {
  p: PortalInfo;
  i: number;
  onPick: (e: React.MouseEvent<HTMLButtonElement>, p: PortalInfo) => void;
}

function ProfessionalHoverBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-700 z-0">
      {/* Perspective Grid Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 229, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 229, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          transform: 'perspective(150px) rotateX(70deg) translateY(20px)',
          transformOrigin: 'bottom center',
          opacity: 0.6
        }}
      />
      {/* 3D Isometric Buildings / Blocks */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 300 300"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyan-face-left" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="cyan-face-right" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Cuboid 1: Left tall block (shifted right) */}
        <g transform="translate(130, 160)">
          <polygon points="0,0 0,110 15,100 15,-10" fill="url(#cyan-face-left)" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="0.5" />
          <polygon points="15,-10 15,100 30,110 30,0" fill="url(#cyan-face-right)" stroke="rgba(0, 229, 255, 0.5)" strokeWidth="0.5" />
          <polygon points="0,0 15,-10 30,0 15,10" fill="rgba(0, 229, 255, 0.3)" stroke="rgba(0, 229, 255, 0.6)" strokeWidth="0.5" />
        </g>

        {/* Cuboid 2: Center-left medium block (shifted right) */}
        <g transform="translate(175, 190)">
          <polygon points="0,0 0,80 12,72 12,-8" fill="url(#cyan-face-left)" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="0.5" />
          <polygon points="12,-8 12,72 24,80 24,0" fill="url(#cyan-face-right)" stroke="rgba(0, 229, 255, 0.5)" strokeWidth="0.5" />
          <polygon points="0,0 12,-8 24,0 12,8" fill="rgba(0, 229, 255, 0.3)" stroke="rgba(0, 229, 255, 0.6)" strokeWidth="0.5" />
        </g>

        {/* Cuboid 3: Center-right back small block (shifted right) */}
        <g transform="translate(215, 175)">
          <polygon points="0,0 0,70 10,63 10,-7" fill="url(#cyan-face-left)" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="0.5" />
          <polygon points="10,-7 10,63 20,70 20,0" fill="url(#cyan-face-right)" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="0.5" />
          <polygon points="0,0 10,-7 20,0 10,7" fill="rgba(0, 229, 255, 0.2)" stroke="rgba(0, 229, 255, 0.5)" strokeWidth="0.5" />
        </g>

        {/* Cuboid 4: Right tall block (shifted right) */}
        <g transform="translate(245, 140)">
          <polygon points="0,0 0,130 18,118 18,-12" fill="url(#cyan-face-left)" stroke="rgba(0, 229, 255, 0.25)" strokeWidth="0.5" />
          <polygon points="18,-12 18,118 36,130 36,0" fill="url(#cyan-face-right)" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="0.5" />
          <polygon points="0,0 18,-12 36,0 18,12" fill="rgba(0, 229, 255, 0.3)" stroke="rgba(0, 229, 255, 0.6)" strokeWidth="0.5" />
        </g>

        {/* Floating databits (cubes) on the right */}
        <g transform="translate(230, 85)" className="animate-bounce" style={{ animationDuration: '4s' }}>
          <polygon points="0,0 6,-3 12,0 6,3" fill="rgba(0, 229, 255, 0.7)" />
        </g>
        <g transform="translate(255, 110)" className="animate-bounce" style={{ animationDuration: '6s' }}>
          <polygon points="0,0 4,-2 8,0 4,2" fill="rgba(0, 229, 255, 0.5)" />
        </g>
        <g transform="translate(240, 140)" className="animate-bounce" style={{ animationDuration: '5s' }}>
          <polygon points="0,0 7,-4 14,0 7,4" fill="rgba(0, 229, 255, 0.8)" />
        </g>
      </svg>
    </div>
  );
}

function PersonalHoverBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-45 transition-opacity duration-700 z-0">
      {/* Warm background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFB703]/2 to-[#FFB703]/5" />
      
      {/* Stepping Stones Path (curving to the right) */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 300 300"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[
          { cx: 150, cy: 260, rx: 28, ry: 8, op: 0.24 },
          { cx: 168, cy: 238, rx: 23, ry: 6.5, op: 0.20 },
          { cx: 184, cy: 218, rx: 19, ry: 5.5, op: 0.16 },
          { cx: 198, cy: 200, rx: 15, ry: 4.5, op: 0.12 },
          { cx: 210, cy: 184, rx: 12, ry: 3.5, op: 0.09 },
          { cx: 220, cy: 170, rx: 9, ry: 2.5, op: 0.06 },
        ].map((stone, idx) => (
          <ellipse
            key={idx}
            cx={stone.cx}
            cy={stone.cy}
            rx={stone.rx}
            ry={stone.ry}
            fill="rgba(255, 183, 3, 0.08)"
            stroke="rgba(255, 183, 3, 0.25)"
            strokeWidth="0.75"
            style={{
              opacity: stone.op,
              filter: 'drop-shadow(0 0 4px rgba(255, 183, 3, 0.15))'
            }}
          />
        ))}
      </svg>

      {/* Floating warm fireflies / bokeh (shifted right) */}
      {Array.from({ length: 14 }).map((_, idx) => {
        const size = 6 + (idx % 3) * 5;
        const left = 45 + (idx * 17) % 50;
        const bottom = 10 + (idx * 13) % 80;
        const delay = (idx * 0.3).toFixed(1);
        const duration = 5 + (idx % 3) * 3;
        return (
          <motion.div
            key={idx}
            className="absolute rounded-full bg-[#FFB703]"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: `${bottom}%`,
              filter: "blur(2px)",
              opacity: 0.15
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, (idx % 2 === 0 ? 12 : -12), 0],
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: parseFloat(delay)
            }}
          />
        );
      })}
    </div>
  );
}

function EmotionalHoverBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-700 z-0">
      {/* Soft yellow/orange ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#FFB703]/2 to-[#FFB703]/5" />
      
      {/* SVG Orbits and Constellations */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-45" 
        viewBox="0 0 300 300"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large sweeping orbits from bottom-left to top-right */}
        <circle 
          cx="45" 
          cy="270" 
          r="160" 
          fill="none" 
          stroke="rgba(255, 183, 3, 0.18)" 
          strokeWidth="0.75" 
          strokeDasharray="4 6" 
          className="origin-[45px_270px] animate-[spin_60s_linear_infinite]" 
        />
        <circle 
          cx="45" 
          cy="270" 
          r="220" 
          fill="none" 
          stroke="rgba(255, 183, 3, 0.12)" 
          strokeWidth="0.5" 
          strokeDasharray="2 8" 
          className="origin-[45px_270px] animate-[spin_90s_linear_infinite_reverse]" 
        />
        <circle 
          cx="45" 
          cy="270" 
          r="280" 
          fill="none" 
          stroke="rgba(255, 183, 3, 0.08)" 
          strokeWidth="0.5" 
        />

        {/* Subtle diagonal constellation lines linking the stars */}
        <line x1="60" y1="105" x2="135" y2="165" stroke="rgba(255, 183, 3, 0.15)" strokeWidth="0.5" />
        <line x1="135" y1="165" x2="240" y2="120" stroke="rgba(255, 183, 3, 0.15)" strokeWidth="0.5" />
        <line x1="240" y1="120" x2="270" y2="210" stroke="rgba(255, 183, 3, 0.1)" strokeWidth="0.5" />
      </svg>

      {/* Twinkling star nodes (shifted to the right) */}
      {[
        { top: '35%', left: '45%', delay: 0, size: 5 },
        { top: '55%', left: '65%', delay: 1.2, size: 6 },
        { top: '40%', left: '80%', delay: 0.6, size: 5 },
        { top: '70%', left: '90%', delay: 1.8, size: 4 },
        { top: '25%', left: '70%', delay: 2.2, size: 3 },
      ].map((star, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full bg-[#FFB703]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            boxShadow: "0 0 10px #FFB703, 0 0 18px rgba(255, 183, 3, 0.6)",
          }}
          animate={{
            scale: [0.7, 1.3, 0.7],
            opacity: [0.3, 0.9, 0.3]
          }}
          transition={{
            duration: 3 + (idx % 2),
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay
          }}
        />
      ))}
    </div>
  );
}

function LayerZeroHoverBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-700 z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#c8b6ff]/5 via-transparent to-transparent" />
      {/* Floating code / binary columns (shifted to the right) */}
      <div className="absolute inset-0 flex justify-end gap-12 pr-6 text-[#c8b6ff]/10 font-mono text-[9px] select-none">
        {Array.from({ length: 6 }).map((_, colIdx) => (
          <motion.div
            key={colIdx}
            className="flex flex-col"
            animate={{ y: [-100, 250] }}
            transition={{
              duration: 6 + colIdx * 2,
              repeat: Infinity,
              ease: "linear",
              delay: colIdx * 0.5
            }}
          >
            {Array.from({ length: 15 }).map((_, charIdx) => (
              <span key={charIdx}>{(charIdx + colIdx) % 2 === 0 ? '0' : '1'}</span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Portal({ p, i, onPick }: PortalProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={filmFrameEnter}
      initial="hidden"
      animate="show"
      custom={i}
      className="perspective-container snap-center flex-shrink-0 w-[280px] sm:w-auto h-full"
    >
      <button
        type="button"
        onClick={(e) => onPick(e, p)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-testid={`portal-${p.name.toLowerCase()}`}
        className="portal-card group flex flex-col justify-between p-6 md:p-8 h-full w-full text-left relative overflow-hidden bg-black/40 border transition-all duration-500 rounded-2xl aspect-square"
        style={{
          borderColor: hovered ? p.accent : 'rgba(255, 255, 255, 0.1)',
          boxShadow: hovered 
            ? `0 20px 50px -10px rgba(0,0,0,0.5), 0 0 25px ${p.accent}40, inset 0 0 15px ${p.accent}20` 
            : "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* Specific Hover Backgrounds */}
        {p.name === "Professional" && <ProfessionalHoverBg />}
        {p.name === "Personal" && <PersonalHoverBg />}
        {p.name === "Emotional" && <EmotionalHoverBg />}

        {/* Portal Info Title */}
        <div className="flex justify-between items-start w-full z-10 relative">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] transition-all duration-500"
                style={{
                  color: hovered ? p.accent : 'rgba(200, 182, 255, 0.6)',
                  textShadow: hovered ? `0 0 10px ${p.accent}40` : undefined
                }}>
            {p.num} · {p.name}
          </span>
          <motion.span
            className="transition-colors"
            style={{
              color: hovered ? p.accent : 'rgba(255, 255, 255, 0.4)'
            }}
            initial={{ x: 0, y: 0 }}
            whileHover={{ x: 3, y: -3 }}
          >
            <ArrowUpRight size={16} strokeWidth={1.2} />
          </motion.span>
        </div>

        {/* Main Verb Title */}
        <div className="z-10 relative my-auto py-6">
          <h3 className="font-display font-semibold text-5xl md:text-6xl text-white tracking-tight leading-none">
            <span className="group-hover:hidden">{p.verb}</span>
            <span
              className="hidden group-hover:inline animate-flicker-intense"
              style={{
                color: p.accent,
                textShadow: `0 0 30px ${p.accent}90, 0 0 60px ${p.accent}40`,
              }}
            >
              {p.verb}.
            </span>
          </h3>
        </div>

        {/* Description */}
        <div className="z-10 relative w-full">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-500"
             style={{
               color: hovered ? `${p.accent}cc` : 'rgba(255, 255, 255, 0.35)',
               textShadow: hovered ? `0 0 10px ${p.accent}30` : undefined
             }}>
            {p.desc}
          </p>
        </div>

        {/* Backlight Projector Glow (Hover) */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${p.accent}15 0%, ${p.accent}02 60%, transparent 100%)`,
            zIndex: 0
          }}
        />
      </button>
    </motion.div>
  );
}

interface LayerZeroPortalProps {
  trigger: (val: any) => void;
}

function LayerZeroPortal({ trigger }: LayerZeroPortalProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={filmFrameEnter}
      initial="hidden"
      animate="show"
      custom={3}
      exit={{ opacity: 0 }}
      className="perspective-container snap-center flex-shrink-0 w-[280px] sm:w-auto h-full"
    >
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          trigger({ rect, color: "#030308", to: "/zero" });
        }}
        data-testid="portal-zero"
        className="portal-card group flex flex-col justify-between p-6 md:p-8 h-full w-full text-left relative overflow-hidden bg-black/40 border transition-all duration-500 rounded-2xl aspect-square"
        style={{
          borderColor: hovered ? "#c8b6ff" : 'rgba(255, 255, 255, 0.1)',
          boxShadow: hovered 
            ? `0 20px 50px -10px rgba(0,0,0,0.5), 0 0 25px rgba(200,182,255,0.4), inset 0 0 15px rgba(200,182,255,0.2)` 
            : "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <LayerZeroHoverBg />

        {/* Portal Info Title */}
        <div className="flex justify-between items-start w-full z-10 relative">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] inline-flex items-center gap-1.5 transition-all duration-500"
                style={{
                  color: hovered ? "#c8b6ff" : 'rgba(200, 182, 255, 0.6)',
                  textShadow: hovered ? `0 0 10px rgba(200,182,255,0.4)` : undefined
                }}>
            <Sparkles size={11} strokeWidth={1.4} />
            00 · Layer Zero
          </span>
          <span className="text-[#c8b6ff]/50 group-hover:text-[#c8b6ff] transition-colors">
            <ArrowUpRight size={16} strokeWidth={1.2} />
          </span>
        </div>

        {/* Main Verb */}
        <div className="z-10 relative my-auto py-6">
          <h3 className="font-display font-semibold text-5xl md:text-6xl text-white tracking-tight leading-none">
            <span className="group-hover:hidden">Stay</span>
            <span
              className="hidden group-hover:inline animate-flicker-intense"
              style={{
                color: "#c8b6ff",
                textShadow: "0 0 30px rgba(200,182,255,0.6), 0 0 60px rgba(200,182,255,0.2)",
              }}
            >
              Stay.
            </span>
          </h3>
        </div>

        {/* Description */}
        <div className="z-10 relative w-full">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-500"
             style={{
               color: hovered ? "rgba(200, 182, 255, 0.8)" : 'rgba(255, 255, 255, 0.35)',
               textShadow: hovered ? `0 0 10px rgba(200,182,255,0.3)` : undefined
             }}>
            For those who linger
          </p>
        </div>

        {/* Backlight Projector Glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(200,182,255,0.15) 0%, rgba(200,182,255,0.02) 60%, transparent 100%)",
            zIndex: 0
          }}
        />
      </button>
    </motion.div>
  );
}

export default function Gateway() {
  const { setDimension } = useContext(DimensionContext);
  const { trigger } = useContext(TransitionContext);
  const unlocked = useUnlock();
  const [greeting] = useState(() => getGreeting());

  useEffect(() => {
    setDimension("gateway");
    document.documentElement.style.setProperty("--grain-opacity", "0.06");
    ensureFirstVisit();
  }, [setDimension]);

  const handlePick = (e: React.MouseEvent<HTMLButtonElement>, p: PortalInfo) => {
    const rect = e.currentTarget.getBoundingClientRect();
    trigger({ rect, color: p.flash, to: p.to });
  };

  const handleRecruiterPick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    trigger({ rect, color: "#fafafa", to: "/recruiter" });
  };

  return (
    <main className="gateway-bg min-h-screen relative overflow-hidden" data-testid="gateway-page">
      {/* Floating depth particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(200,182,255,${0.1 + Math.random() * 0.15})`,
              boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(200,182,255,0.15)`,
            }}
            animate={{
              y: [0, -30 - Math.random() * 40, 0],
              x: [0, (Math.random() - 0.5) * 20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 md:px-12 py-6 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/30"
        style={{ zIndex: 5 }}
      >
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#c8b6ff] animate-pulse" style={{ boxShadow: "0 0 8px rgba(200,182,255,0.5)" }} />
          Portfolio
        </span>
        <span>Hemanth Naga Sai Chakka</span>
      </motion.div>

      <div className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-28 md:py-32 relative" style={{ zIndex: 2 }}>
        {/* Hero section with 3D perspective */}
        <div className="perspective-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-16 lg:mb-24">
            {/* Living Portrait */}
            <motion.div
              variants={cinematicReveal}
              initial="hidden"
              animate="show"
              custom={0}
              className="lg:col-span-5 flex justify-center lg:justify-start"
            >
              <LivingPortrait src="/avatar.jpeg" alt="Hemanth digital avatar" />
            </motion.div>

            {/* Heading */}
            <div className="lg:col-span-7">
              <motion.p
                variants={cinematicReveal}
                initial="hidden"
                animate="show"
                custom={1}
                className="font-mono text-xs uppercase tracking-[0.3em] text-white/35 mb-6"
                data-testid="gateway-kicker"
              >
                Choose a world to enter — each is a different side of the same person
              </motion.p>

              <h1 className="font-display font-bold leading-[1.1] tracking-tight text-[15vw] md:text-[10vw] lg:text-[7.2vw]">
                {[profile.firstName, profile.middleName].map((wordBlock, i) => (
                  <motion.span
                    key={wordBlock}
                    variants={cinematicReveal}
                    initial="hidden"
                    animate="show"
                    custom={2 + i}
                    className="block gradient-text text-3d pb-[0.25em] -mb-[0.25em]"
                    data-testid={`gateway-name-${i}`}
                  >
                    {wordBlock}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                variants={cinematicReveal}
                initial="hidden"
                animate="show"
                custom={4}
                className="mt-8 max-w-xl text-base md:text-lg text-white/60 font-spectral italic leading-relaxed"
                data-testid="gateway-tagline"
              >
                {greeting}
              </motion.p>
              <motion.p
                variants={cinematicReveal}
                initial="hidden"
                animate="show"
                custom={5}
                className="mt-2 max-w-xl text-sm md:text-[15px] text-white/35 font-spectral italic leading-relaxed"
                data-testid="gateway-subline"
              >
                {SUBLINE}
              </motion.p>
            </div>
          </div>
        </div>

        {/* WORLDS PORTALS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8"
        >
          {/* Section label */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-4">
              <Sparkles size={14} strokeWidth={1.2} className="text-[#c8b6ff] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
                Explore Worlds · Direct Entry
              </span>
            </div>
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] hidden sm:inline">
              Select a dimension below
            </span>
          </div>

          {/* Worlds wrapper */}
          <div className="relative w-full py-4 my-4">
            {/* Middle area: horizontal snap scroll on mobile, grid on desktop */}
            <div className={`my-2 flex flex-row overflow-x-auto snap-x snap-mandatory scrollbar-none md:grid ${unlocked ? "md:grid-cols-4" : "md:grid-cols-3"} gap-6 relative z-10 w-full`}>
              {portals.map((p, i) => (
                <Portal key={p.num} p={p} i={i} onPick={handlePick} />
              ))}
              <AnimatePresence>
                {unlocked && (
                  <LayerZeroPortal trigger={trigger} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* CINEMATIC HORIZONTAL TIMELINE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-20 relative"
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
                Chronological Path
              </span>
              <div className="h-px w-20 bg-white/5" />
            </div>
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">
              Milestones
            </span>
          </div>

          {/* Timeline Track Container */}
          <div className="relative w-full py-10 px-4 bg-black/25 border border-white/5 rounded-md overflow-hidden">
            {/* The Horizontal Line Axis */}
            <div className="absolute top-[68%] left-0 right-0 h-[2px] bg-gradient-to-r from-white/5 via-[#c8b6ff]/30 to-white/5" style={{ zIndex: 0 }}>
              {/* Glowing active shadow across the entire track */}
              <div className="absolute inset-0 bg-[#c8b6ff]/20 blur-[1px]" />
            </div>

            {/* Scrolling track */}
            <div className="relative z-10 flex gap-6 md:gap-10 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {milestones.map((m, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center snap-center w-[220px] sm:w-[240px] group">

                  {/* Timeline Card */}
                  <div
                    className="w-full bg-[#08080c]/85 border border-white/10 hover:border-[#c8b6ff]/60 p-5 rounded-md backdrop-blur-md transition-colors duration-300 shadow-lg relative text-left"
                    style={{
                      boxShadow: "0 8px 25px rgba(0,0,0,0.6)"
                    }}
                  >
                    {/* Glowing top accent stripe */}
                    <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#c8b6ff]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-xs font-semibold tracking-wider text-[#c8b6ff]">
                        {m.year}
                      </span>
                      <span className="font-mono text-[9px] text-white/25 whitespace-nowrap">
                        [0{i + 1}]
                      </span>
                    </div>

                    <p className="font-sans text-[13px] font-medium text-white/75 leading-relaxed group-hover:text-white transition-colors whitespace-normal break-words">
                      {m.label}
                    </p>
                  </div>

                  {/* Vertical Connector Line */}
                  <div className="w-[1.5px] h-6 bg-gradient-to-b from-white/10 to-white/20 mt-3 group-hover:from-[#c8b6ff]/30 group-hover:to-[#c8b6ff]/50 transition-all duration-300" />

                  {/* Axis Node/Dot */}
                  <div className="relative mt-1">
                    {/* Outer glow ring on hover */}
                    <div className="absolute -inset-2 rounded-full bg-[#c8b6ff]/10 scale-0 group-hover:scale-100 transition-transform duration-300" />

                    {/* The physical dot */}
                    <div className="w-4 h-4 rounded-full bg-[#050507] border-2 border-white/25 flex items-center justify-center relative z-10 transition-colors duration-300 group-hover:border-[#c8b6ff] shadow-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 transition-colors duration-300 group-hover:bg-[#c8b6ff]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Help Indicator */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none opacity-40">
              <span className="font-mono text-[8px] text-white/30 uppercase tracking-widest">
                Swipe or drag to explore path →
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 2 }}
          className="mt-16 flex justify-between items-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/20"
        >
          <span>Scroll · Click · Linger</span>
          <button
            onClick={handleRecruiterPick}
            className="hover:text-white/60 transition-colors glass-pill px-3 py-1.5"
            data-testid="gateway-recruiter-link"
          >
            Recruiter view →
          </button>
        </motion.div>
      </div>
    </main>
  );
}
