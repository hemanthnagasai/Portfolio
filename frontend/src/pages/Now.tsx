import { useContext, useEffect } from "react";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";
import portfolioData from "@/data/portfolio.json";
import Leaf from "@/components/kit/Leaf";
import { PopIn } from "@/components/kit/Kinetic";

const now = portfolioData.now;
const nowFills = ["fill-orange", "fill-cobalt", "fill-lime", "fill-ink"];

// A "/now" page (nownownow.com): what I'm focused on right now, edited in
// portfolio.json — which also grounds the chatbot, so the AI me stays
// current for free.
export default function Now() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Now — Hemanth Naga Sai Chakka",
    "What Hemanth is focused on right now — work, learning, and the constants.",
  );

  useEffect(() => {
    setDimension("gateway");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <Leaf
      title="Now"
      heading={["Now."]}
      intro={now.intro}
      note={`Updated ${now.updated}`}
      testId="now-page"
      backTestId="now-back-link"
      footer={[
        { to: "/how-i-built-this", label: "How this site was built" },
        { to: "/query", label: "Query my data" },
      ]}
    >
      <ol className="flex flex-col gap-5">
        {now.items.map((item, i) => (
          <li key={item.title} data-testid={`now-item-${i}`}>
            <PopIn delay={i * 0.07} soft>
              <article className={`tile ${nowFills[i % nowFills.length]} p-5 md:p-6 flex items-start gap-4`}>
                <span className="badge mt-0.5">{i + 1}</span>
                <div>
                  <h2 className="lead text-xl md:text-2xl">{item.title}</h2>
                  <p className="reading mt-2 max-w-prose">{item.note}</p>
                </div>
              </article>
            </PopIn>
          </li>
        ))}
      </ol>
    </Leaf>
  );
}
