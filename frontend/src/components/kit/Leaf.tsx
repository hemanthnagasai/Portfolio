import { Link } from "react-router-dom";
import RunningHead from "@/components/kit/RunningHead";
import { Slam } from "@/components/kit/Kinetic";

interface LeafProps {
  /** Short name for the top bar. */
  title: string;
  /** The statement, one line per entry. */
  heading: string[];
  intro?: React.ReactNode;
  /** A dated or factual note, e.g. "Updated July 2026". */
  note?: React.ReactNode;
  testId: string;
  backTestId: string;
  footer?: { to: string; label: string; external?: boolean; testId?: string; icon?: React.ReactNode }[];
  /** Widen the column for working pages (the SQL console). */
  wide?: boolean;
  children: React.ReactNode;
}

// A standalone page: one cream scene, a slammed statement, then the content.
export default function Leaf({ title, heading, intro, note, testId, backTestId, footer, wide, children }: LeafProps) {
  return (
    <main className="scene scene-cream min-h-screen" data-testid={testId}>
      <RunningHead title={title} backTestId={backTestId} />
      <div className="max-w-page mx-auto px-[var(--page-x)] pt-12 md:pt-16 pb-28">
        <header className="max-w-[52rem]">
          <Slam as="h1" words={heading} className="mega text-[clamp(3rem,9vw,7rem)]" />
          {intro && <p className="lead text-[clamp(1.25rem,2.2vw,1.625rem)] mt-8 max-w-[40rem]">{intro}</p>}
          {note && <p className="pill fill-ink text-sm mt-6">{note}</p>}
        </header>

        <div className={`mt-14 md:mt-20 ${wide ? "" : "max-w-[44rem]"}`}>{children}</div>

        {footer && footer.length > 0 && (
          <footer className="mt-20 flex flex-wrap gap-3">
            {footer.map((f) =>
              f.external ? (
                <a
                  key={f.label}
                  href={f.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn fill-ink"
                  style={{ ["--card-shadow" as string]: "var(--orange)" } as React.CSSProperties}
                  data-testid={f.testId}
                >
                  {f.icon}
                  {f.label}
                </a>
              ) : (
                <Link
                  key={f.label}
                  to={f.to}
                  className="btn fill-ink"
                  style={{ ["--card-shadow" as string]: "var(--orange)" } as React.CSSProperties}
                  data-testid={f.testId}
                >
                  {f.label}
                </Link>
              ),
            )}
          </footer>
        )}
      </div>
    </main>
  );
}
