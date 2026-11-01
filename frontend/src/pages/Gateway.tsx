import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import { profile } from "@/data/portfolio";
import { getGreeting, SUBLINE } from "@/utils/greeting";
import useUnlock, { ensureFirstVisit, getProgress, getVisited, OVER } from "@/hooks/useUnlock";
import usePageMeta from "@/hooks/usePageMeta";
import { readMinutes } from "@/lib/content";
import TurnLink from "@/components/kit/TurnLink";
import { CycleWord, Dots, Marquee, PopIn, Scramble, StrikeSwap } from "@/components/kit/Kinetic";

interface World {
  key: string;
  name: string;
  verb: string;
  find: string;
  to: string;
  fill: string;
  scene: string;
}

const worlds: World[] = [
  { key: "professional", name: "Professional", verb: "Build.", find: "The analyst, the builder.", to: "/professional", fill: "fill-orange", scene: "var(--cobalt)" },
  { key: "personal", name: "Personal", verb: "Live.", find: "The human, the friend.", to: "/personal", fill: "fill-lime", scene: "var(--orange)" },
  { key: "emotional", name: "Emotional", verb: "Feel.", find: "The heart, and a letter.", to: "/emotional", fill: "fill-cream", scene: "var(--ink)" },
];

const milestones = [
  { year: "2019", label: "Class X · 9.50 GPA" },
  { year: "2021", label: "Intermediate · 87.8%" },
  { year: "2025", label: "B.Tech · KITS" },
  { year: "2025", label: "EY · Intern" },
  { year: "2025", label: "EY · Senior Data Analyst" },
  { year: "2026", label: "EY · Associate Consultant" },
];
const milestoneFills = ["fill-orange", "fill-cobalt", "fill-lime", "fill-ink", "fill-orange", "fill-cobalt"];

const ease = [0.16, 1, 0.3, 1] as const;

function Portrait() {
  // The owner's sticker, pasted in. If the file ever goes missing the page
  // simply goes without it rather than showing a broken image.
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <PopIn
      rotate={-4}
      delay={0.35}
      className="order-first md:order-none col-span-12 md:col-span-5 md:justify-self-end w-[8.5rem] md:w-full md:max-w-[21rem]"
    >
      <img
        src="/portrait.webp"
        alt="Illustration of Hemanth, waving hello"
        width={640}
        height={778}
        onError={() => setOk(false)}
        className="block w-full h-auto [filter:drop-shadow(8px_10px_0_rgba(10,10,10,0.9))]"
        data-testid="gateway-portrait"
      />
    </PopIn>
  );
}

// The locked fourth card says "no entry" in Telugu, then a lime bar scans
// it into English, the way the reel reads a sign.
function NoEntrySign() {
  const reduced = useReducedMotion();
  const [english, setEnglish] = useState(false);
  useEffect(() => {
    // The Telugu face only downloads when Telugu is drawn; fetch it now so
    // the sign never flashes in a fallback font.
    document.fonts?.load('800 1em "Anek Telugu"', "ప్రవేశం లేదు").catch(() => {});
    if (reduced) return;
    const t = setInterval(() => setEnglish((e) => !e), 2600);
    return () => clearInterval(t);
  }, [reduced]);
  return (
    <span className="relative block overflow-hidden" aria-label="No entry">
      <span aria-hidden="true" className="block">
        {english ? (
          <span className="mega text-lime text-[clamp(2.5rem,5vw,4rem)] block">No entry</span>
        ) : (
          <span className="telugu text-cream text-[clamp(2.25rem,4.5vw,3.5rem)] block leading-[1.25]">ప్రవేశం లేదు</span>
        )}
      </span>
      {!reduced && (
        <motion.span
          key={english ? "en" : "te"}
          aria-hidden="true"
          className="absolute inset-y-0 w-2 bg-lime"
          initial={{ left: "0%", opacity: 1 }}
          animate={{ left: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease }}
        />
      )}
    </span>
  );
}

export default function Gateway() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Hemanth Naga Sai Chakka — A Portfolio in Layers",
    "Explore the professional, personal, and emotional dimensions of Hemanth Naga Sai Chakka — Associate Consultant at EY.",
  );
  const reduced = useReducedMotion();
  const unlocked = useUnlock();
  const [greeting] = useState(() => getGreeting());
  const [progress] = useState(() => getProgress());
  const [visited] = useState(() => getVisited());
  const totalRead = worlds.reduce((n, w) => n + (progress[w.key] || 0), 0);
  const totalMinutes = worlds.reduce((n, w) => n + readMinutes[w.key], 0);
  // Reading already done fills in just after arrival, so a returning reader
  // sees their own visit written back.
  const [inked, setInked] = useState(false);

  useEffect(() => {
    setDimension("gateway");
    ensureFirstVisit();
    window.scrollTo(0, 0);
    const t = setTimeout(() => setInked(true), 450);
    return () => clearTimeout(t);
  }, [setDimension]);

  const nameLines = [profile.firstName, profile.middleName, `${profile.lastName}.`];

  return (
    <main data-testid="gateway-page">
      {/* Scene 1 — cream: hello */}
      <section className="scene scene-cream min-h-[100svh] flex flex-col">
        <div className="max-w-page w-full mx-auto px-[var(--page-x)] pt-5 flex items-center justify-between gap-4">
          <span className="lead text-[0.9375rem]">Hemanth Chakka</span>
          <TurnLink
            to="/recruiter"
            sheet="var(--cream)"
            className="btn fill-ink text-sm !py-2.5"
            style={{ ["--card-shadow" as string]: "var(--orange)" } as React.CSSProperties}
            data-testid="gateway-recruiter-link"
          >
            Recruiter view <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
          </TurnLink>
        </div>

        <div className="max-w-page w-full mx-auto px-[var(--page-x)] flex-1 grid grid-cols-12 gap-x-6 gap-y-8 items-center py-10 md:py-12">
          <div className="col-span-12 md:col-span-7">
            <motion.p
              className="lead text-[clamp(1.25rem,2.4vw,1.75rem)] mb-5"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              data-testid="gateway-tagline"
            >
              {greeting}
            </motion.p>
            <h1 className="mega text-[clamp(3.5rem,10vw,9rem)]">
              <span className="sr-only">{nameLines.join(" ")}</span>
              {nameLines.map((line, i) => (
                <motion.span
                  key={line}
                  aria-hidden="true"
                  className="block origin-left"
                  initial={reduced ? false : { opacity: 0, scale: 2.2, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.14, ease }}
                  data-testid={`gateway-name-${i}`}
                >
                  {line}
                </motion.span>
              ))}
            </h1>
            <motion.div
              className="mt-8 flex flex-wrap gap-2.5"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease }}
            >
              <span className="pill fill-orange">Associate Consultant · EY</span>
              <span className="pill fill-ink">{profile.origin}</span>
            </motion.div>
            <p className="lead text-ink-soft mt-6 max-w-[34rem]" data-testid="gateway-subline">
              {SUBLINE}
            </p>
          </div>
          <Portrait />
        </div>

        <Marquee words={["Hemanth", "Naga Sai", "Chakka"]} className="pb-4 md:pb-6" />
      </section>

      {/* Scene 2 — cobalt: the worlds, as a hand of cards */}
      <section className="scene scene-cobalt" aria-labelledby="worlds-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] pt-20 md:pt-28">
          <h2 id="worlds-head" className="mega text-[clamp(3.25rem,9vw,8rem)]">
            <span className="block lead normal-case tracking-[-0.025em] text-[clamp(1.25rem,2.4vw,1.75rem)] mb-3">
              Pick one. Each is a different side of the same person.
            </span>
            <CycleWord words={["Build.", "Live.", "Feel."]} className="text-lime" />
          </h2>

          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
            {worlds.map((w, i) => {
              const read = progress[w.key] || 0;
              return (
                <PopIn key={w.key} delay={i * 0.08}>
                  <TurnLink
                    to={w.to}
                    sheet={w.scene}
                    className={`card card-press ${w.fill} flex flex-col justify-between gap-8 p-6 md:p-7 min-h-[15rem] md:min-h-[17rem] no-underline`}
                    aria-label={`${w.name}. ${w.find} ${readMinutes[w.key]} minute read, ${read} of 6 read.`}
                    data-testid={`portal-${w.key}`}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="lead text-xl">{w.name}</span>
                      <span className="pill fill-ink text-xs !py-1.5">{readMinutes[w.key]} min</span>
                    </span>
                    <span>
                      <span className="mega block text-[clamp(3.25rem,6.5vw,5.5rem)]">{w.verb}</span>
                      <span className="block font-semibold mt-3">{w.find}</span>
                    </span>
                    <span className="flex items-center justify-between">
                      <Dots filled={inked ? read : 0} label={`${read} of 6 read`} />
                      {visited.includes(w.key) ? (
                        <span className="badge" aria-hidden="true">
                          <Check size={15} strokeWidth={3} />
                        </span>
                      ) : (
                        <ArrowRight size={24} strokeWidth={2.5} aria-hidden="true" />
                      )}
                    </span>
                  </TurnLink>
                </PopIn>
              );
            })}

            <PopIn delay={0.24}>
              {unlocked ? (
                <TurnLink
                  to="/zero"
                  sheet="var(--lime)"
                  className="card card-press fill-ink flex flex-col justify-between gap-8 p-6 md:p-7 min-h-[15rem] md:min-h-[17rem] no-underline"
                  style={{ ["--card-shadow" as string]: "var(--lime)" } as React.CSSProperties}
                  data-testid="portal-zero"
                >
                  <span className="lead text-xl">Layer Zero</span>
                  <span>
                    <span className="mega block text-lime text-[clamp(3.25rem,6.5vw,5.5rem)]">Stay.</span>
                    <span className="block font-semibold mt-3">For those who linger.</span>
                  </span>
                  <ArrowRight size={24} strokeWidth={2.5} aria-hidden="true" className="self-end" />
                </TurnLink>
              ) : (
                <div
                  className="card fill-ink flex flex-col justify-between gap-8 p-6 md:p-7 min-h-[15rem] md:min-h-[17rem]"
                  style={{ ["--card-shadow" as string]: "var(--lime)" } as React.CSSProperties}
                  data-testid="portal-zero-locked"
                >
                  <span className="lead text-xl text-cream-soft">A fourth side</span>
                  <NoEntrySign />
                  <span className="font-semibold text-cream-soft">Opens for those who linger.</span>
                </div>
              )}
            </PopIn>
          </div>

          <p className="mt-10 flex flex-wrap items-center gap-3" data-testid="worlds-total">
            <span className="pill fill-cream">
              {totalRead} of {OVER * worlds.length} read
            </span>
            <span className="lead text-[var(--fg-soft)]">About {totalMinutes} minutes for all three.</span>
          </p>
        </div>

        <Marquee words={["Build", "Live", "Feel", "Stay"]} reverse className="mt-16 md:mt-24 pb-6" />
      </section>

      {/* Scene 3 — cream: the route so far */}
      <section className="scene scene-cream" aria-labelledby="milestones-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          <h2 id="milestones-head" className="mega text-[clamp(3rem,8vw,7rem)]">
            How I got
            <span className="block text-cobalt">here.</span>
          </h2>
          <div role="list" className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            {milestones.map((m, i) => (
              <PopIn key={i} delay={i * 0.06} rotate={i % 2 ? 1.5 : -1.5}>
                <div role="listitem" className={`card ${milestoneFills[i]} p-4 md:p-5 h-full flex flex-col justify-between gap-6 min-h-[9.5rem]`}>
                  <Scramble text={m.year} className="mega text-[2.5rem] md:text-[2.75rem] block" />
                  <span className="font-semibold leading-snug text-[0.9375rem]">{m.label}</span>
                </div>
              </PopIn>
            ))}
          </div>
        </div>
      </section>

      {/* Scene 4 — ink: the end card, the way every reel signs off */}
      <section className="scene scene-ink" aria-labelledby="end-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] pt-20 md:pt-28">
          <h2 id="end-head" className="mega text-[clamp(3rem,9vw,7.5rem)]">
            <StrikeSwap
              struck="Developer"
              landed="Just a consultant"
              label="Not a developer. Just a consultant."
              className="[&>span:last-child]:text-lime"
            />
          </h2>
          <p className="lead text-[clamp(1.25rem,2.4vw,1.75rem)] mt-8 max-w-[34rem]">
            Built with Claude, and{" "}
            <Link to="/how-i-built-this" className="underline decoration-orange decoration-[3px] underline-offset-4 hover:text-lime">
              the honest story of how
            </Link>{" "}
            is one page away.
          </p>
          <p className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="lead text-orange text-[clamp(1.5rem,3vw,2.25rem)]">Follow for more</span>
            <a
              href={profile.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="lead text-[clamp(1.125rem,2vw,1.375rem)] text-cream underline decoration-lime decoration-[3px] underline-offset-4 hover:text-lime"
              data-testid="gateway-instagram-link"
            >
              @hemanth_chakka
            </a>
            <span className="lead text-[var(--fg-soft)] text-[clamp(1rem,1.8vw,1.25rem)]">
              for AI. Songs live on{" "}
              <a
                href={profile.links.music}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream underline decoration-orange decoration-[3px] underline-offset-4 hover:text-lime"
                data-testid="gateway-music-link"
              >
                @hemanth_.sings_
              </a>
              .
            </span>
          </p>
          <nav aria-label="More pages" className="mt-12 flex flex-wrap gap-3.5">
            {[
              { to: "/now", label: "Now", id: "gateway-now-link" },
              { to: "/how-i-built-this", label: "How it's built", id: "gateway-how-link" },
              { to: "/query", label: "Query my data", id: "gateway-query-link" },
              { to: "/privacy", label: "Privacy", id: "gateway-privacy-link" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="btn fill-cream" data-testid={l.id}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <Marquee words={["Just a consultant", "Built with Claude"]} stroke="var(--lime)" className="mt-16 md:mt-24 pb-28" />
      </section>
    </main>
  );
}
