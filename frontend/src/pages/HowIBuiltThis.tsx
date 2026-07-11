import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Github } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";

const reveal = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const FACTS = [
  { value: "4", label: "dimensions + 1 hidden layer" },
  { value: "40", label: "automated tests on every push" },
  { value: "4", label: "CI jobs incl. a Docker smoke test" },
  { value: "1", label: "AI version of me you can talk to" },
];

// The long-form version of the story: a data analyst building a full-stack
// site with an AI pair, staying in the loop the whole way. Content is
// deliberately honest — including the bugs.
export default function HowIBuiltThis() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "How I Built This — Hemanth Naga Sai Chakka",
    "A data analyst, an AI pair, and a portfolio that reveals itself in layers — the honest story of how this site was built.",
  );

  useEffect(() => {
    setDimension("gateway");
    document.documentElement.style.setProperty("--grain-opacity", "0.04");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main
      className="min-h-screen relative"
      style={{ background: "var(--bg-void)", color: "#f0f0f5" }}
      data-testid="how-page"
    >
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-16 relative">
        <div className="flex justify-between items-center mb-14 font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:text-white/60 transition-colors"
            data-testid="how-back-link"
          >
            <ArrowLeft size={11} /> Gateway
          </Link>
          <span>The making of</span>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-playfair text-4xl md:text-6xl leading-[1.15] text-[#f5f2ff]">
            How I built this
          </h1>
          <p className="font-spectral italic text-lg text-white/45 mt-5 leading-relaxed max-w-[58ch]">
            A data analyst, an AI pair, and a portfolio that reveals itself in layers. The honest
            version — including the parts that broke.
          </p>
        </motion.header>

        {/* Fact strip */}
        <motion.div
          {...reveal}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden"
        >
          {FACTS.map((f) => (
            <div key={f.label} className="bg-[#08080f] px-4 py-5">
              <div className="font-heading text-2xl text-[#c8b6ff]">{f.value}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/35 mt-1.5 leading-relaxed">
                {f.label}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="mt-16 space-y-14 font-spectral text-[16px] leading-[1.85] text-white/65 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:text-white/90 [&_h2]:tracking-tight [&_h2]:mb-4 [&_strong]:text-white/85 [&_strong]:font-semibold">
          <motion.section {...reveal}>
            <h2>The idea</h2>
            <p>
              I didn't want a portfolio that reads like a resume with better fonts. People reveal
              themselves in layers — so the site does too. Four dimensions, each a different side
              of the same person: what I do, how I live, what I feel. A recruiter in a hurry gets a
              clean escape hatch instead; their time matters more than my aesthetics.
            </p>
          </motion.section>

          <motion.section {...reveal}>
            <h2>The honest part</h2>
            <p>
              I'm a data analyst, not a developer. I built this with AI — Claude, in a coding
              environment — and I think the honest framing matters: the AI wrote most of the code,
              and <strong>I was in it the whole time</strong>. Every decision that shaped this site
              was a conversation: what to build, what to cut, what "done" means, whether the fix
              was real or just plausible-sounding. I opened it on my phone, felt it lag, and sat
              there with the AI figuring out why until it stopped.
            </p>
            <p className="mt-4">
              That lag turned out to be three things fighting for the GPU at once: real-time soft
              shadows, a second scroll loop, and a full-screen blend-mode overlay repainting every
              0.8 seconds. We shipped the fix the same night. That's what "building with AI" means
              to me — not pressing a button, but steering.
            </p>
          </motion.section>

          <motion.section {...reveal}>
            <h2>What's under it</h2>
            <p>
              React 19 and Three.js on the front — every dimension is its own WebGL world, with
              adaptive quality so phones get a lighter render and a static fallback when WebGL
              isn't there at all. A FastAPI backend serves the site, generates my resume PDF on
              the fly, moderates the guestbook with AI, and runs the chatbot — an AI version of me,
              grounded in the same JSON file that renders this site. One data file feeds the
              pages, the bot, and the resume, so they can't drift apart.
            </p>
            <p className="mt-4">
              Around it: strict security headers, per-visitor rate limiting, streaming chat
              replies, and a CI pipeline with 38 automated tests — including one job that builds
              the actual production container and checks it works before anything deploys.
            </p>
          </motion.section>

          <motion.section {...reveal}>
            <h2>The bugs make the best stories</h2>
            <p>
              The Emotional dimension floats eighteen candle lanterns along a spiral. Every candle
              had a shadow-casting light — and WebGL caps shadow textures at sixteen. Past the
              limit, the shaders silently failed to compile and the scene broke on real GPUs. The
              console evidence was there; we just had to actually read it. The candles kept their
              glow, lost their invisible shadows, and the scene renders everywhere now.
            </p>
            <p className="mt-4">
              My favorite one is less flattering. A refactor made the resume PDF build from the
              site's data file — cleaner design, and it caught two certifications that had already
              drifted out of my resume. But the production container didn't ship that data file,
              so the download button quietly returned an error <strong>in production only</strong>.
              The AI introduced the bug, found it when I reported the button was dead, fixed it —
              and then added a CI job that builds the real container and downloads the PDF from it
              on every push, so that entire class of bug can't reach production again. Broken,
              fixed, then made structurally impossible. I'll take that trade.
            </p>
          </motion.section>

          <motion.section {...reveal}>
            <h2>What I took away</h2>
            <p>
              I didn't come out of this with a finished project and an empty head. I came out
              knowing more than when I started — about rendering budgets, security headers, cache
              policy, test design, and what it feels like to make engineering calls with a very
              fast, very capable collaborator that still needs someone to say "that's not it,
              look again."
            </p>
            <p className="mt-4">
              If you're curious what that collaboration produces, you're looking at it. Or go one
              layer deeper and{" "}
              <Link to="/query" className="text-[#c8b6ff] hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
                query my life in SQL
              </Link>
              .
            </p>
          </motion.section>
        </div>

        <footer className="mt-20 pt-8 border-t border-white/5 flex items-center gap-6 flex-wrap font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">
          <a
            href="https://github.com/hemanthnagasai/Portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-white/60 transition-colors"
            data-testid="how-github-link"
          >
            <Github size={12} /> The code is public
          </a>
          <Link to="/now" className="hover:text-white/60 transition-colors">
            What I'm doing now →
          </Link>
        </footer>
      </div>
    </main>
  );
}
