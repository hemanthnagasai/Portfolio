import { useRef, useState } from "react";
import { X } from "lucide-react";
import { PopIn } from "@/components/kit/Kinetic";

export interface Sketch {
  src: string;
  title: string;
  /** Written on the sketch itself, when he dated it. */
  date?: string;
  alt: string;
  width: number;
  height: number;
}

// His pencil sketches, photographed on the paper they were drawn on and
// pinned up at a slight angle. Tapping one opens it full size.
export default function SketchGallery({ sketches }: { sketches: Sketch[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Sketch | null>(null);

  const show = (s: Sketch) => {
    setOpen(s);
    dialog.current?.showModal();
  };

  return (
    <>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-10 items-start">
        {sketches.map((s, i) => (
          <li key={s.src}>
            <PopIn delay={i * 0.1} rotate={[-2.5, 1.5, -1][i % 3]}>
              <button
                type="button"
                onClick={() => show(s)}
                className="card card-press fill-ink block w-full p-2.5 pb-3 text-left"
                style={{ ["--card-shadow" as string]: "var(--orange)" } as React.CSSProperties}
                aria-label={`Open ${s.title} full size`}
                data-testid={`sketch-${i}`}
              >
                <img
                  src={s.src}
                  alt={s.alt}
                  width={s.width}
                  height={s.height}
                  loading="lazy"
                  className="block w-full h-auto rounded-[0.75rem]"
                />
                <span className="mt-3 flex items-center justify-between gap-3 px-1.5">
                  <span className="lead text-lg">{s.title}</span>
                  {s.date && <span className="pill fill-lime text-xs !py-1">{s.date}</span>}
                </span>
              </button>
            </PopIn>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          // A click on the backdrop (the dialog itself, not its content) closes it.
          if (e.target === dialog.current) dialog.current?.close();
        }}
        className="m-auto max-h-[92vh] max-w-[min(92vw,56rem)] bg-transparent p-0 backdrop:bg-ink/85"
        aria-label={open ? open.title : "Sketch"}
      >
        {open && (
          <figure className="relative">
            <img
              src={open.src}
              alt={open.alt}
              className="block max-h-[86vh] w-auto rounded-[1.125rem] border-[3px] border-cream"
            />
            <figcaption className="mt-3 flex items-center gap-3">
              <span className="pill fill-cream">{open.title}</span>
              {open.date && <span className="pill fill-lime">{open.date}</span>}
            </figcaption>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="absolute -top-3 -right-3 grid h-11 w-11 place-items-center rounded-full bg-lime text-ink border-[3px] border-ink"
              aria-label="Close"
            >
              <X size={20} strokeWidth={3} aria-hidden="true" />
            </button>
          </figure>
        )}
      </dialog>
    </>
  );
}
