import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const BARS = 32;

/**
 * The reels' voice waveform: a row of bars that rest low, and move with the
 * real audio of whatever is playing once an analyser is handed in.
 */
export default function VoiceBars({ analyser, className = "" }: { analyser: AnalyserNode | null; className?: string }) {
  const row = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const bars = row.current ? Array.from(row.current.children) as HTMLElement[] : [];
    const rest = () => bars.forEach((b, i) => (b.style.transform = `scaleY(${0.12 + ((i * 7) % 5) * 0.025})`));
    if (!analyser || reduced) {
      rest();
      return;
    }
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      // Voice sits in the lower bins; mirror them so the row peaks in the middle.
      const usable = Math.floor(data.length * 0.55);
      for (let i = 0; i < BARS; i++) {
        const fromCentre = Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2);
        const bin = Math.floor(fromCentre * (usable - 1));
        const v = data[bin] / 255;
        bars[i].style.transform = `scaleY(${Math.max(0.1, Math.min(1, v * 1.15))})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      rest();
    };
  }, [analyser, reduced]);

  return (
    <div ref={row} className={`flex h-16 items-center gap-[5px] ${className}`} aria-hidden="true" data-testid="voice-bars">
      {Array.from({ length: BARS }, (_, i) => (
        <span
          key={i}
          className={`block h-full w-[5px] rounded-full origin-center transition-transform duration-75 ${i % 6 === 2 ? "bg-cobalt" : "bg-ink"}`}
        />
      ))}
    </div>
  );
}
