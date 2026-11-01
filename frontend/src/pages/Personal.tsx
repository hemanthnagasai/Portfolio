import { useContext, useEffect } from "react";
import { Mic, PencilLine, BrainCircuit, ArrowUpRight } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import { personal, profile } from "@/data/portfolio";
import { markVisited, ensureFirstVisit, useReadingProgress } from "@/hooks/useUnlock";
import usePageMeta from "@/hooks/usePageMeta";
import RunningHead from "@/components/kit/RunningHead";
import { Marquee, PopIn, Slam, StrikeSwap } from "@/components/kit/Kinetic";

// A cricket ball: lucide has no icon for it, so it's drawn here in the
// same stroke as the others.
function CricketBall({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 4.2c2.6 4.6 2.6 11 0 15.6M16.5 4.2c-2.6 4.6-2.6 11 0 15.6" />
    </svg>
  );
}

const hobbyLook = [
  { fill: "fill-orange", icon: <Mic size={28} strokeWidth={2} aria-hidden="true" />, note: "fully." },
  { fill: "fill-lime", icon: <CricketBall />, note: "a philosophy." },
  { fill: "fill-cream", icon: <PencilLine size={28} strokeWidth={2} aria-hidden="true" />, note: "quiet." },
  { fill: "fill-ink", icon: <BrainCircuit size={28} strokeWidth={2} aria-hidden="true" />, note: "for wonder." },
];

// Hobbies that have a public page link out to it.
const hobbyLinks: Record<string, { href: string; label: string }> = {
  Singing: { href: profile.links.music, label: "Listen on Instagram" },
  "Exploring AI": { href: profile.links.instagram, label: "See it on Instagram" },
};

// "Connection over convenience." → struck: convenience, landed: connection.
function splitValue(v: string): { landed: string; struck: string } | null {
  const m = v.match(/^(.+?) over (.+?)\.?$/i);
  return m ? { landed: m[1], struck: m[2] } : null;
}

export default function Personal() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Personal — Hemanth Naga Sai Chakka",
    "Hobbies, values, and the people behind the work — the personal dimension of Hemanth Naga Sai Chakka.",
  );
  const read = useReadingProgress("personal");

  useEffect(() => {
    setDimension("personal");
    ensureFirstVisit();
    markVisited("personal");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main data-testid="personal-page">
      <RunningHead title="Personal" progress={read} backTestId="personal-back-link" scene="scene-orange" />

      {/* Opening — orange */}
      <section className="scene scene-orange">
        <div className="max-w-page mx-auto px-[var(--page-x)] pt-10 md:pt-16 pb-12">
          <Slam as="h1" words={personal.heading} className="mega text-[clamp(3.75rem,12vw,10rem)]" />
          <blockquote className="lead text-[clamp(1.5rem,3vw,2.25rem)] mt-10 max-w-[30ch]" data-testid="personal-quote">
            {personal.quote}
          </blockquote>
        </div>
        <Marquee words={personal.heading.map((h) => h.replace(/\.$/, ""))} className="pb-6 mt-8" />
      </section>

      {/* Story — cream */}
      <section className="scene scene-cream">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28 grid grid-cols-12 gap-x-6 gap-y-10">
          <h2 className="col-span-12 mega text-[clamp(3rem,8vw,7rem)]">
            From
            <span className="block text-cobalt">Mangalagiri.</span>
          </h2>
          <p className="col-span-12 lg:col-span-8 lg:col-start-5 reading text-[1.25rem] md:text-[1.375rem]" data-testid="personal-bio">
            {personal.bio}
          </p>
        </div>
      </section>

      {/* Hobbies — cobalt */}
      <section className="scene scene-cobalt" aria-labelledby="hobbies-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          <h2 id="hobbies-head" className="mega text-[clamp(2.75rem,7vw,6rem)]">
            Things that make
            <span className="block text-lime">me, me.</span>
          </h2>
          <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
            {personal.hobbies.map((h, i) => {
              const look = hobbyLook[i % hobbyLook.length];
              return (
                <li key={h.title} data-testid={`personal-hobby-${i}`}>
                  <PopIn delay={i * 0.08} rotate={i % 2 ? 1.2 : -1.2} className="h-full">
                    <article
                      className={`card ${look.fill} p-6 md:p-7 h-full flex flex-col gap-6`}
                      style={look.fill === "fill-ink" ? ({ ["--card-shadow" as string]: "var(--lime)" } as React.CSSProperties) : undefined}
                    >
                      <span className="flex items-start justify-between gap-4">
                        <h3 className="mega text-[clamp(2.25rem,4vw,3.25rem)]">{h.title}</h3>
                        {look.icon}
                      </span>
                      <p className="reading">{h.note}</p>
                      <span className="mt-auto flex flex-wrap items-center gap-2.5">
                        <span className={`pill ${look.fill === "fill-ink" ? "fill-lime" : "fill-ink"} text-sm`} aria-hidden="true">
                          {look.note}
                        </span>
                        {hobbyLinks[h.title] && (
                          <a
                            href={hobbyLinks[h.title].href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn !py-2 !px-4 text-sm fill-cream"
                            data-testid={`personal-hobby-link-${i}`}
                          >
                            {hobbyLinks[h.title].label}
                            <ArrowUpRight size={15} strokeWidth={2.5} aria-hidden="true" />
                          </a>
                        )}
                      </span>
                    </article>
                  </PopIn>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Values — ink */}
      <section className="scene scene-ink" aria-labelledby="values-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          <h2 id="values-head" className="lead text-[clamp(1.25rem,2.4vw,1.75rem)] text-[var(--fg-soft)]">
            What I value.
          </h2>
          <ul className="mt-10 flex flex-col gap-10 md:gap-14">
            {personal.values.map((v, i) => {
              const parts = splitValue(v);
              return (
                <li key={v} className="mega text-[clamp(2.5rem,7vw,5.75rem)]" data-testid={`personal-value-${i}`}>
                  {parts ? (
                    <StrikeSwap struck={parts.struck} landed={parts.landed} className="[&>span:last-child]:text-lime" />
                  ) : (
                    v
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Closing — lime */}
      <section className="scene scene-lime">
        <div className="max-w-page mx-auto px-[var(--page-x)] pt-20 md:pt-28 pb-36">
          <div data-testid="personal-closing">
            <Slam
              as="p"
              words={[`“${personal.closing}”`]}
              className="mega text-[clamp(2.5rem,6.5vw,5.5rem)] max-w-[16ch]"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
