import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* The reels' kinetic vocabulary, as small pieces the pages compose. */

const ease = [0.16, 1, 0.3, 1] as const;

// A slam starts at 2.2x, wider than the screen, so it can never pass an
// in-view threshold itself. The unscaled parent watches the viewport and
// hands "show" down to its words.
const slamWord = {
  hidden: { opacity: 0, scale: 2.2, filter: "blur(6px)" },
  show: (d: number) => ({ opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, delay: d, ease } }),
};
// The reels' card spring: back-out with a little overshoot.
const cardSpring = { type: "spring", stiffness: 420, damping: 22, mass: 0.9 } as const;

/** The four-point star that separates marquee words. */
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className} fill="none">
      <path
        d="M20 2c1.6 9.6 8.4 16.4 18 18-9.6 1.6-16.4 8.4-18 18-1.6-9.6-8.4-16.4-18-18C11.6 18.4 18.4 11.6 20 2Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Outlined giant type that runs along a scene's edge. Decoration only. */
export function Marquee({
  words,
  reverse = false,
  size = "clamp(4rem, 11vw, 9rem)",
  speed = 38,
  stroke,
  className = "",
}: {
  words: string[];
  reverse?: boolean;
  size?: string;
  speed?: number;
  stroke?: string;
  className?: string;
}) {
  const run = (key: string) => (
    <div key={key} className="flex items-center shrink-0">
      {words.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className="marquee-text px-[0.18em]" style={{ fontSize: size }}>
            {w}
          </span>
          <Star className="shrink-0" />
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={`overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ ["--stroke" as string]: stroke, ["--marquee-speed" as string]: `${speed}s` } as React.CSSProperties}
    >
      <div className="marquee [&_svg]:w-[0.42em] [&_svg]:h-[0.42em]" data-reverse={reverse} style={{ fontSize: size, color: stroke ?? "var(--fg)" }}>
        {run("a")}
        {run("b")}
      </div>
    </div>
  );
}

/**
 * Words that slam in from 2.2x scale, one after another, the way the reels
 * land each verb. Visible by default for reduced motion.
 */
export function Slam({
  words,
  className = "",
  wordClassName = () => "",
  delay = 0,
  stagger = 0.12,
  as = "span",
}: {
  words: string[];
  className?: string;
  wordClassName?: (i: number) => string;
  delay?: number;
  stagger?: number;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag className={className} initial={reduced ? false : "hidden"} whileInView="show" viewport={{ once: true, amount: 0.3 }}>
      <span className="sr-only">{words.join(" ")}</span>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={`block origin-left ${wordClassName(i)}`}
          variants={slamWord}
          custom={delay + i * stagger}
        >
          {w}
        </motion.span>
      ))}
    </Tag>
  );
}

/** One slot that cycles through words, each slamming in over the last. */
export function CycleWord({ words, interval = 2800, className = "" }: { words: string[]; interval?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [reduced, words.length, interval]);
  return (
    <span className={`relative block overflow-hidden pb-[0.06em] ${className}`}>
      <span className="sr-only">{words.join(" ")}</span>
      <motion.span
        key={i}
        aria-hidden="true"
        className="block origin-left"
        initial={reduced ? false : { opacity: 0, scale: 2.2, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease }}
      >
        {words[i]}
      </motion.span>
    </span>
  );
}

/**
 * Digits roll through random values before settling, like the reel's
 * price counter. Non-digits (₹, %, dots, letters) stay put.
 */
export function Scramble({ text, className = "", duration = 900 }: { text: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (!inView || reduced) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(
        text
          .split("")
          .map((ch, idx) =>
            /\d/.test(ch) && p < 1 && idx / text.length >= p * 0.9 ? String(Math.floor(Math.random() * 10)) : ch,
          )
          .join(""),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, text, duration]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

/**
 * The reel's end card: a word gets struck through in orange, then its
 * replacement lands. "Connection over convenience." reads as
 * ~~CONVENIENCE~~ CONNECTION.
 */
export function StrikeSwap({
  struck,
  landed,
  label,
  className = "",
}: {
  struck: string;
  landed: string;
  /** What a screen reader hears; defaults to "<landed> over <struck>." */
  label?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className={`block ${className}`}
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
    >
      <span className="sr-only">{label ?? `${landed} over ${struck}.`}</span>
      <span aria-hidden="true" className="relative inline-block">
        <span className="text-[var(--fg-soft)]">{struck}</span>
        <motion.span
          className="absolute left-[-0.04em] right-[-0.04em] top-1/2 h-[0.13em] -translate-y-1/2 rounded-full bg-orange origin-left"
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.45, ease, delay: 0.15 } } }}
        />
      </span>
      <motion.span aria-hidden="true" className="block origin-left" variants={slamWord} custom={0.6}>
        {landed}.
      </motion.span>
    </motion.span>
  );
}

/** Six dots, filled for each sixth of a world actually read. */
export function Dots({ filled, label, className = "" }: { filled: number; label: string; className?: string }) {
  return (
    <span className={`dots ${className}`} role="img" aria-label={label}>
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} data-on={i < filled} style={{ transitionDelay: `${i * 60}ms` }} />
      ))}
    </span>
  );
}

/** A card that springs in as it enters the viewport. */
export function PopIn({
  children,
  className = "",
  delay = 0,
  rotate = 0,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  rotate?: number;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd">) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, scale: 0.6, rotate: rotate - 6 }}
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ ...cardSpring, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
