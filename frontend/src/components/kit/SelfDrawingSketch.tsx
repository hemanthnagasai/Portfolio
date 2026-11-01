import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Strokes {
  width: number;
  height: number;
  /** Rows trimmed off the top of the photo before tracing. */
  cropTop: number;
  strokes: { d: string; len: number }[];
}

// How much of the pinned scroll draws the lines; the rest fades the real
// sketch in underneath and lets it sit.
const DRAW_END = 0.72;
const PHOTO_IN: [number, number] = [0.74, 0.88];
const CAPTION_IN: [number, number] = [0.84, 0.94];

const ramp = (p: number, [a, b]: [number, number]) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/**
 * His Krishna sketch, traced into the pen strokes it was drawn with, draws
 * itself again as the visitor scrolls. Then the photograph of the real
 * sketch fades in under the lines. Reduced motion skips straight to the
 * finished sketch.
 */
export default function SelfDrawingSketch() {
  const section = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [data, setData] = useState<Strokes | null>(null);
  // Cumulative length fractions, so long strokes take longer to draw.
  const stops = useRef<number[]>([]);
  const drawn = useRef(0);

  // The strokes are their own chunk, fetched only when this page loads.
  useEffect(() => {
    let alive = true;
    import("@/data/krishna-strokes.json").then((m) => {
      if (!alive) return;
      const d = m.default as Strokes;
      const total = d.strokes.reduce((n, s) => n + s.len, 0);
      let run = 0;
      stops.current = d.strokes.map((s) => (run += s.len) / total);
      setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Drawing starts while the scene is still rising into view, so the pin
  // never opens on an empty page.
  const { scrollYProgress } = useScroll({ target: section, offset: ["start 0.55", "end end"] });

  // The photo, the fading lines and the caption follow the same scroll
  // position as the pen, written straight to the elements each frame.
  const fade = (p: number) => {
    const t = ramp(p, PHOTO_IN);
    if (photo.current) photo.current.style.opacity = String(t);
    if (svg.current) svg.current.style.opacity = String(1 - t * 0.65);
    if (caption.current) caption.current.style.opacity = String(ramp(p, CAPTION_IN));
  };

  // Update only the strokes whose state changed since the last frame:
  // everything before the pen is drawn, everything after is blank.
  const drawTo = (p: number) => {
    const paths = svg.current?.querySelectorAll<SVGPathElement>("path");
    if (!paths || !paths.length) return;
    const target = Math.min(1, Math.max(0, p / DRAW_END));
    const s = stops.current;
    let i = 0;
    while (i < s.length && s[i] <= target) i++;
    const lo = Math.min(drawn.current, i);
    const hi = Math.max(drawn.current, i);
    for (let k = Math.max(0, lo - 1); k <= Math.min(paths.length - 1, hi); k++) {
      if (k < i) paths[k].style.strokeDashoffset = "0";
      else if (k > i) paths[k].style.strokeDashoffset = "1";
    }
    if (i < paths.length) {
      const start = i === 0 ? 0 : s[i - 1];
      const frac = (target - start) / Math.max(1e-6, s[i] - start);
      paths[i].style.strokeDashoffset = String(1 - Math.min(1, Math.max(0, frac)));
    }
    drawn.current = i;
  };

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    drawTo(p);
    fade(p);
  });

  // Once the paths exist, draw them to wherever the page already is.
  useEffect(() => {
    if (data && !reduced) {
      drawn.current = data.strokes.length;
      drawTo(scrollYProgress.get());
      fade(scrollYProgress.get());
    }
    // drawTo only reads refs; running it again on every render is not needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, reduced]);

  const vb = data ? `0 0 ${data.width} ${data.height}` : "0 0 960 1240";

  return (
    <section
      ref={section}
      className={`scene scene-cream ${reduced ? "" : "h-[240vh] md:h-[320vh] !overflow-visible"}`}
      aria-labelledby="hand-head"
      data-testid="self-drawing-sketch"
    >
      <div className={`${reduced ? "" : "sticky top-0 h-[100svh]"} overflow-hidden`}>
        <div className="max-w-page h-full mx-auto px-[var(--page-x)] py-12 md:py-0 grid grid-cols-12 gap-x-6 gap-y-8 items-center">
          <div className="col-span-12 md:col-span-5">
            <h2 id="hand-head" className="mega text-[clamp(3rem,8vw,7rem)]">
              By
              <span className="block text-cobalt">hand.</span>
            </h2>
            <p className="lead text-[clamp(1.125rem,2vw,1.5rem)] mt-6 max-w-[26rem]">
              Every line here comes from one of my pencil sketches. Keep scrolling and it draws itself again.
            </p>
            <div ref={caption} style={reduced ? undefined : { opacity: 0 }} className="mt-8 flex flex-wrap items-center gap-3">
              <span className="pill fill-ink">Krishna · pencil on paper</span>
              <Link to="/personal#sketches" className="btn fill-lime text-sm !py-2.5" data-testid="hand-sketches-link">
                See the sketches <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 flex justify-center md:justify-end">
            <div
              className="relative w-full max-w-[26rem] md:max-w-none md:w-auto md:h-[min(84svh,52rem)]"
              style={{ aspectRatio: data ? `${data.width} / ${data.height}` : "960 / 1240" }}
            >
              {/* The real sketch, cropped the same way the trace was. */}
              <img
                ref={photo}
                src="/art/sketch-krishna.webp"
                alt="Pencil sketch of Krishna with eyes closed, framed by a peacock feather, flowers and paisley patterns, signed 'Art by Hemanth'."
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-bottom rounded-[1.125rem]"
                style={reduced ? undefined : { opacity: 0 }}
              />
              <svg
                ref={svg}
                viewBox={vb}
                className="absolute inset-0 h-full w-full"
                style={reduced ? { opacity: 0 } : undefined}
                aria-hidden="true"
                fill="none"
                stroke="var(--ink)"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {data?.strokes.map((s, i) => (
                  <path key={i} d={s.d} pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
