import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";

interface ReelPlayerProps {
  src: string;
  poster: string;
  /** What the reel is, for screen readers and the play button. */
  label: string;
  /**
   * Loop silently while on screen, with a sound toggle (the AI intro).
   * Otherwise it waits for a tap and plays with sound (the singing).
   */
  ambient?: boolean;
  className?: string;
  testId?: string;
}

// One of his reels, in a phone-shaped card. Nothing downloads until the
// reel is needed: ambient reels load when they scroll into view, the rest
// when tapped.
export default function ReelPlayer({ src, poster, label, ambient = false, className = "", testId }: ReelPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(ambient);

  // Ambient reels play only while visible, and never for reduced motion.
  useEffect(() => {
    const v = ref.current;
    if (!ambient || reduced || !v) return;
    // React doesn't write the muted attribute, and browsers only allow
    // autoplay for video they know is silent, so say so on the element.
    v.defaultMuted = true;
    v.muted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().then(() => setStarted(true)).catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [ambient, reduced]);

  const playWithSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().then(() => setStarted(true)).catch(() => {});
  };

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().then(() => setStarted(true)).catch(() => {});
  };

  return (
    <figure
      className={`card relative overflow-hidden rounded-[1.75rem] border-[3px] border-ink bg-ink aspect-[9/16] ${className}`}
      data-testid={testId}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload={ambient ? "metadata" : "none"}
        playsInline
        loop={ambient}
        muted={muted}
        controls={!ambient && started}
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
        onEnded={() => !ambient && setStarted(false)}
      />

      {!ambient && !started && (
        <button
          type="button"
          onClick={playWithSound}
          className="absolute inset-0 grid place-items-center bg-ink/15 group"
          aria-label={`Play ${label} with sound`}
        >
          <span className="btn fill-lime text-base group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            <Play size={18} strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
            Play with sound
          </span>
        </button>
      )}

      {ambient && (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute bottom-3 right-3 pill fill-ink text-sm !py-2 !px-3.5"
          aria-pressed={!muted}
          aria-label={muted ? `Turn sound on for ${label}` : `Mute ${label}`}
        >
          {muted ? <VolumeX size={16} strokeWidth={2.5} aria-hidden="true" /> : <Volume2 size={16} strokeWidth={2.5} aria-hidden="true" />}
          {muted ? "Sound on" : "Mute"}
        </button>
      )}
    </figure>
  );
}
