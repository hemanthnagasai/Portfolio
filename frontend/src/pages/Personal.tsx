import { useContext, useEffect, useState } from "react";
import { Mic, PencilLine, BrainCircuit, ArrowUpRight, ArrowDown } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import { personal, profile } from "@/data/portfolio";
import { markVisited, ensureFirstVisit, useReadingProgress } from "@/hooks/useUnlock";
import usePageMeta from "@/hooks/usePageMeta";
import RunningHead from "@/components/kit/RunningHead";
import { Marquee, PopIn, Slam, StrikeSwap } from "@/components/kit/Kinetic";
import ReelPlayer from "@/components/kit/ReelPlayer";
import VoiceBars from "@/components/kit/VoiceBars";
import SketchGallery, { Sketch } from "@/components/kit/SketchGallery";

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

// Hobbies with something to show: the real thing further down this page,
// or his public page for it.
const hobbyLinks: Record<string, { href: string; label: string; external?: boolean }> = {
  Singing: { href: "#singing", label: "Hear me sing" },
  "Pencil Art": { href: "#sketches", label: "See the sketches" },
  "Exploring AI": { href: profile.links.instagram, label: "See it on Instagram", external: true },
};

const sketches: Sketch[] = [
  {
    src: "/art/sketch-shiva.webp",
    title: "Shiva",
    alt: "Pencil sketch of Lord Shiva's face: the three ash lines and third eye on the forehead, heavy brows, wide eyes, full lips.",
    width: 1080,
    height: 1092,
  },
  {
    src: "/art/sketch-batman.webp",
    title: "Batman",
    date: "18.04.22",
    alt: "Pencil sketch of Batman from the chest up, cape torn at the shoulders, signed 'By Hemanth' and dated 18/04/22.",
    width: 1050,
    height: 1400,
  },
  {
    src: "/art/sketch-krishna.webp",
    title: "Krishna",
    alt: "Pencil sketch of Krishna with eyes closed, framed by a peacock feather, flowers and paisley patterns, signed 'Art by Hemanth'.",
    width: 960,
    height: 1280,
  },
];

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
  // The singing reel's live audio, while it plays.
  const [voice, setVoice] = useState<AnalyserNode | null>(null);

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
          <Slam
            as="h1"
            words={["Not the loudest", "in the room."]}
            className="mega text-[clamp(3rem,8vw,7.5rem)]"
            wordClassName={(i) => (i === 1 ? "outline-word" : "")}
          />
          <blockquote className="lead text-[clamp(1.5rem,3vw,2.25rem)] mt-10 max-w-[30ch]" data-testid="personal-quote">
            {/* The headline already says the first sentence; this is its payoff. */}
            {personal.quote.replace(/^.*?\.\s+/, "")}
          </blockquote>
        </div>
        <Marquee words={personal.hobbies.map((h) => h.title)} className="pb-6 mt-8" />
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
                  <PopIn delay={i * 0.08} soft className="h-full">
                    <article className={`tile ${look.fill} p-6 md:p-7 h-full flex flex-col gap-6`}>
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
                            {...(hobbyLinks[h.title].external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="btn !py-2 !px-4 text-sm fill-cream"
                            data-testid={`personal-hobby-link-${i}`}
                          >
                            {hobbyLinks[h.title].label}
                            {hobbyLinks[h.title].external ? (
                              <ArrowUpRight size={15} strokeWidth={2.5} aria-hidden="true" />
                            ) : (
                              <ArrowDown size={15} strokeWidth={2.5} aria-hidden="true" />
                            )}
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

      {/* Pencil art — cream: the real sketches */}
      <section id="sketches" className="scene scene-cream scroll-mt-16" aria-labelledby="sketches-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          <h2 id="sketches-head" className="mega text-[clamp(3rem,8vw,7rem)]">
            Pencil,
            <span className="block text-cobalt">paper.</span>
          </h2>
          <p className="lead text-[clamp(1.25rem,2.4vw,1.75rem)] mt-6 max-w-[34rem]">
            Quiet, patient, detail-oriented. Everything I am when no one is watching.
          </p>
          <div className="mt-12 md:mt-16">
            <SketchGallery sketches={sketches} />
          </div>
        </div>
      </section>

      {/* Singing — lime: the real voice */}
      <section id="singing" className="scene scene-lime scroll-mt-16" aria-labelledby="singing-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28 grid grid-cols-12 gap-x-6 gap-y-12 items-center">
          <div className="col-span-12 md:col-span-7">
            <h2 id="singing-head" className="mega text-[clamp(3rem,8vw,7rem)]">
              <span className="block">Not</span>
              <StrikeSwap struck="Perfectly" landed="Fully" label="Not perfectly. Just fully." className="[&>span:last-child]:text-cobalt" />
            </h2>
            <p className="lead text-[clamp(1.25rem,2.4vw,1.75rem)] mt-8 max-w-[30rem]">
              Not professionally. Music is where I go when words aren't enough.
            </p>
            <VoiceBars analyser={voice} className="mt-8" />
            <a
              href={profile.links.music}
              target="_blank"
              rel="noopener noreferrer"
              className="btn fill-ink mt-8"
              data-testid="personal-music-link"
            >
              More on @hemanth_.sings_
              <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden="true" />
            </a>
          </div>
          <div className="col-span-12 md:col-span-5 justify-self-center md:justify-self-end w-full max-w-[19rem]">
            <ReelPlayer
              src="/media/music-reel.mp4"
              poster="/media/music-reel-poster.webp"
              label="Hemanth singing a Telugu song"
              testId="music-reel"
              onAnalyser={setVoice}
            />
          </div>
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

      {/* Closing — orange, bookending the opening */}
      <section className="scene scene-orange">
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
