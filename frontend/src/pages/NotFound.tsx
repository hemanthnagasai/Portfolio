import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";
import { Marquee, Slam } from "@/components/kit/Kinetic";

// Any address that isn't a page: the reels' style, and two ways back.
export default function NotFound() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta("Not found — Hemanth Naga Sai Chakka", "This page isn't in any of the worlds.");

  useEffect(() => {
    setDimension("gateway");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main className="scene scene-orange min-h-[100svh] flex flex-col" data-testid="not-found-page">
      <div className="max-w-page w-full mx-auto px-[var(--page-x)] flex-1 flex flex-col justify-center py-16">
        <p className="lead text-[clamp(1.25rem,2.4vw,1.75rem)]">404</p>
        <Slam as="h1" words={["Wrong", "layer."]} className="mega text-[clamp(4rem,14vw,12rem)] mt-3" />
        <p className="lead text-[clamp(1.25rem,2.4vw,1.75rem)] mt-8 max-w-[30rem]">
          This page isn't in any of the worlds. Maybe it never was.
        </p>
        <div className="mt-10 flex flex-wrap gap-3.5">
          <Link to="/" className="btn fill-ink" data-testid="not-found-home">
            Back to the Gateway <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <Link to="/recruiter" className="btn fill-cream">
            Recruiter view
          </Link>
        </div>
      </div>
      <Marquee words={["Not here", "Wrong layer"]} className="pb-6" />
    </main>
  );
}
