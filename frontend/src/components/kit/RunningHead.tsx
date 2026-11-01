import { ArrowLeft } from "lucide-react";
import TurnLink from "@/components/kit/TurnLink";
import { Dots } from "@/components/kit/Kinetic";

interface RunningHeadProps {
  title: string;
  /** When set, shows how much of this page has been read. */
  progress?: number;
  backTestId?: string;
  /** Scene class of the first scene, so the bar sits on the same ground. */
  scene?: string;
}

// The bar across the top of every page: the way back, the page's name,
// and how much of it you've read.
export default function RunningHead({ title, progress, backTestId, scene = "scene-cream" }: RunningHeadProps) {
  return (
    <header className={`${scene} sticky top-0 z-40 bg-[var(--bg)] text-[var(--fg)]`}>
      <div className="max-w-page mx-auto px-[var(--page-x)] h-16 flex items-center justify-between gap-4">
        <TurnLink
          to="/"
          className="pill bg-[var(--fg)] text-[var(--bg)] text-sm no-underline transition-transform hover:-translate-x-0.5"
          data-testid={backTestId}
        >
          <ArrowLeft size={16} strokeWidth={2.5} aria-hidden="true" />
          Gateway
        </TurnLink>
        <span className="flex items-center gap-3">
          <span className="lead text-sm">{title}</span>
          {progress !== undefined && <Dots filled={progress} label={`${progress} of 6 read`} />}
        </span>
      </div>
    </header>
  );
}
