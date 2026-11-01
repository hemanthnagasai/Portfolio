import { useContext, useEffect } from "react";
import { DimensionContext } from "@/context/DimensionContext";
import { emotional } from "@/data/portfolio";
import LeaveATrace from "@/components/LeaveATrace";
import { markVisited, ensureFirstVisit, useReadingProgress } from "@/hooks/useUnlock";
import usePageMeta from "@/hooks/usePageMeta";
import RunningHead from "@/components/kit/RunningHead";
import { Slam } from "@/components/kit/Kinetic";

export default function Emotional() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Emotional — Hemanth Naga Sai Chakka",
    "Letters, reflections, and a place to leave a trace — the emotional dimension of Hemanth Naga Sai Chakka.",
  );
  const read = useReadingProgress("emotional");

  useEffect(() => {
    setDimension("emotional");
    ensureFirstVisit();
    markVisited("emotional");
    window.scrollTo(0, 0);
  }, [setDimension]);

  const heading = emotional.heading.split(/(?<=\.)\s+/);

  return (
    <main data-testid="emotional-page">
      <RunningHead title="Emotional" progress={read} backTestId="emotional-back-link" scene="scene-ink" />

      {/* The letter — ink. The loudest style on the site goes quiet here:
          only the title moves; the letter itself just reads. */}
      <section className="scene scene-ink">
        <div className="max-w-page mx-auto px-[var(--page-x)] pt-10 md:pt-16 pb-24">
          <div data-testid="emotional-heading">
            <Slam
              as="h1"
              words={heading}
              className="mega text-[clamp(3.75rem,12vw,10rem)]"
              wordClassName={(i) => (i === heading.length - 1 ? "text-orange" : "")}
            />
          </div>

          <article className="mt-16 md:mt-24 max-w-[38rem] md:ml-[18%] space-y-8">
            {emotional.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-[1.25rem] md:text-[1.375rem] leading-[1.65] font-medium tracking-[-0.014em] whitespace-pre-line"
                data-testid={`emotional-para-${i}`}
              >
                {p}
              </p>
            ))}
            <p className="mega text-[clamp(2.5rem,5vw,3.75rem)] text-lime pt-6" data-testid="emotional-signoff">
              — Hemanth
            </p>
          </article>
        </div>
      </section>

      <LeaveATrace />
    </main>
  );
}
