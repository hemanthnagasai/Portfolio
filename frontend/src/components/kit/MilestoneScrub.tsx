import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { PopIn } from "@/components/kit/Kinetic";

interface Milestone {
  year: string;
  label: string;
}

const fills = ["fill-cobalt", "fill-lime", "fill-cream", "fill-ink", "fill-cobalt", "fill-lime"];

/**
 * The route so far, as a strip of cards the visitor scrubs through: the
 * scene pins, and scrolling down slides the years past sideways. Reduced
 * motion gets the same cards as a plain grid.
 */
export default function MilestoneScrub({ milestones }: { milestones: Milestone[] }) {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  // How far the strip has to slide: its width minus what fits on screen.
  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setTravel(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0.08, 0.92], [0, -travel]);
  const x = useSpring(raw, { stiffness: 220, damping: 32, mass: 0.4 });

  const heading = (
    <h2 id="milestones-head" className="mega text-[clamp(3rem,8vw,7rem)]">
      How I got
      <span className="block outline-word">here.</span>
    </h2>
  );

  const card = (m: Milestone, i: number, wide: boolean) => (
    <div
      role="listitem"
      className={`tile ${fills[i % fills.length]} p-5 md:p-6 flex flex-col justify-between gap-8 ${
        wide ? "w-[17rem] md:w-[22rem] min-h-[14rem] md:min-h-[17rem] shrink-0" : "h-full min-h-[9.5rem]"
      }`}
    >
      {/* Years stay still: on a strip read while it moves, a rolling digit
          reads as a wrong date. */}
      <span className={`mega block ${wide ? "text-[clamp(3.5rem,6vw,5.5rem)]" : "text-[2.75rem]"}`}>{m.year}</span>
      <span className={`font-bold leading-snug ${wide ? "text-lg md:text-xl" : "text-[0.9375rem]"}`}>{m.label}</span>
    </div>
  );

  if (reduced) {
    return (
      <section className="scene scene-orange" aria-labelledby="milestones-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          {heading}
          <div role="list" className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {milestones.map((m, i) => (
              <div key={i}>{card(m, i, false)}</div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={section} className="scene scene-orange h-[200vh] md:h-[260vh] !overflow-visible" aria-labelledby="milestones-head">
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-center">
        <div className="max-w-page w-full mx-auto px-[var(--page-x)]">{heading}</div>
        <motion.div
          ref={track}
          role="list"
          style={{ x }}
          className="mt-10 md:mt-14 flex gap-6 md:gap-8 w-max pl-[max(var(--page-x),calc((100vw-80rem)/2+var(--page-x)))] pr-[var(--page-x)] py-4"
        >
          {milestones.map((m, i) => (
            <PopIn key={i} delay={i * 0.05} soft>
              {card(m, i, true)}
            </PopIn>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
