import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";
import Leaf from "@/components/kit/Leaf";
import { PopIn, Scramble } from "@/components/kit/Kinetic";

const FACTS = [
  { value: "4", label: "dimensions + 1 hidden layer" },
  { value: "40", label: "automated tests on every push" },
  { value: "4", label: "CI jobs incl. a Docker smoke test" },
  { value: "1", label: "AI version of me you can talk to" },
];
const factFills = ["fill-orange", "fill-cobalt", "fill-lime", "fill-ink"];

// The long-form version of the story: a consultant building a full-stack
// site with an AI pair, staying in the loop the whole way. Content is
// deliberately honest — including the bugs.
export default function HowIBuiltThis() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "How I Built This — Hemanth Naga Sai Chakka",
    "A consultant, an AI pair, and a portfolio that reveals itself in layers — the honest story of how this site was built.",
  );

  useEffect(() => {
    setDimension("gateway");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <Leaf
      title="The making of"
      heading={["How I", "built this."]}
      intro="A consultant, an AI pair, and a portfolio that reveals itself in layers. The honest version — including the parts that broke."
      testId="how-page"
      backTestId="how-back-link"
      footer={[
        {
          to: "https://github.com/hemanthnagasai/Portfolio",
          label: "The code is public",
          external: true,
          testId: "how-github-link",
          icon: <Github size={15} strokeWidth={1.75} aria-hidden="true" />,
        },
        { to: "/now", label: "What I'm doing now" },
      ]}
    >
      <ul className="grid grid-cols-2 gap-4 mb-16">
        {FACTS.map((f, i) => (
          <li key={f.label}>
            <PopIn delay={i * 0.07} soft className="h-full">
              <div className={`tile ${factFills[i % factFills.length]} p-5 h-full flex flex-col justify-between gap-6`}>
                <Scramble text={f.value} className="mega text-[3rem] block" />
                <span className="font-bold leading-snug">{f.label}</span>
              </div>
            </PopIn>
          </li>
        ))}
      </ul>

      <div className="leaf-prose">
          <section>
            <h2>The idea</h2>
            <p>
              I didn't want a portfolio that reads like a resume with better fonts. People reveal
              themselves in layers — so the site does too. Four dimensions, each a different side
              of the same person: what I do, how I live, what I feel. A recruiter in a hurry gets a
              clean escape hatch instead; their time matters more than my aesthetics.
            </p>
          </section>

          <section>
            <h2>The honest part</h2>
            <p>
              I'm a consultant, not a developer. I built this with AI — Claude, in a coding
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
          </section>

          <section>
            <h2>What's under it</h2>
            <p>
              React 19 on the front. The first version ran every dimension as its own Three.js
              world; the redesign traded that for the style of my Instagram reels — kinetic type
              and playful cards, the same look people already know me by. A FastAPI backend serves the site, generates my resume PDF on
              the fly, moderates the guestbook with AI, and runs the chatbot — an AI version of me,
              grounded in the same JSON file that renders this site. One data file feeds the
              pages, the bot, and the resume, so they can't drift apart.
            </p>
            <p className="mt-4">
              Around it: strict security headers, per-visitor rate limiting, streaming chat
              replies, and a CI pipeline with 38 automated tests — including one job that builds
              the actual production container and checks it works before anything deploys.
            </p>
          </section>

          <section>
            <h2>The bugs make the best stories</h2>
            <p>
              The first Emotional dimension floated eighteen candle lanterns along a spiral. Every candle
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
          </section>

          <section>
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
              <Link to="/query">
                query my life in SQL
              </Link>
              .
            </p>
          </section>
      </div>
    </Leaf>
  );
}
