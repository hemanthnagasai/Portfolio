import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";
import RunningHead from "@/components/kit/RunningHead";
import { PopIn, Slam } from "@/components/kit/Kinetic";

// Layer Zero: the lime scene only the people who linger ever reach.
export default function LayerZero() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta("Layer Zero — Hemanth Naga Sai Chakka");

  useEffect(() => {
    setDimension("emotional");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main className="scene scene-lime min-h-screen" data-testid="layer-zero-page">
      <RunningHead title="Layer Zero" backTestId="zero-back-link" scene="scene-lime" />

      <section className="max-w-page mx-auto px-[var(--page-x)] pt-10 md:pt-16 pb-28 grid grid-cols-12 gap-x-6 gap-y-14">
        <div className="col-span-12 lg:col-span-7">
          <Slam as="h1" words={["You", "stayed."]} className="mega text-[clamp(4rem,11vw,9.5rem)]" />
          <p className="lead text-[clamp(1.375rem,2.6vw,2rem)] mt-10 max-w-[28ch]" data-testid="zero-paragraph">
            This page doesn't appear on first visits. It appears for the people who linger. You're one of
            them now.
          </p>
          <blockquote className="mega text-[clamp(1.75rem,3.2vw,2.5rem)] mt-12 max-w-[20ch] text-cobalt" data-testid="zero-lyric">
            “If you find me here, you've already found enough.”
          </blockquote>
          <div className="mt-12">
            <Link to="/" className="btn fill-ink">
              Back to the worlds, when you're ready
            </Link>
          </div>
        </div>

        <PopIn rotate={3} delay={0.2} className="col-span-12 md:col-span-6 lg:col-span-5 lg:pt-6" data-testid="zero-polaroid">
          <figure className="card fill-cream p-3 pb-4">
            <img
              alt="Mangalagiri seen from above, temple towers among the town"
              src="/mangalagiri.jpeg"
              className="block w-full aspect-[4/3] object-cover rounded-[0.75rem]"
              loading="lazy"
            />
            <figcaption className="lead mt-3 px-1">Mangalagiri, from above.</figcaption>
          </figure>
        </PopIn>
      </section>
    </main>
  );
}
