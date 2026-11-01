import { useContext, useEffect } from "react";
import { Download } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import { professional } from "@/data/portfolio";
import { markVisited, ensureFirstVisit, useReadingProgress } from "@/hooks/useUnlock";
import usePageMeta from "@/hooks/usePageMeta";
import { parseStints } from "@/lib/content";
import RunningHead from "@/components/kit/RunningHead";
import { Marquee, PopIn, Scramble, Slam } from "@/components/kit/Kinetic";

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || "";

const certifications = professional.certs.filter((c) => c.type !== "achievement");
const achievements = professional.certs.filter((c) => c.type === "achievement");

const roleFills = ["fill-orange", "fill-cobalt", "fill-lime"];
const projectFills = ["fill-orange", "fill-lime"];
const scoreFills = ["fill-cobalt", "fill-orange", "fill-lime"];

function SceneHead({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mega text-[clamp(3rem,8vw,6.5rem)]">
      {children}
    </h2>
  );
}

export default function Professional() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Professional — Hemanth Naga Sai Chakka",
    "Experience at EY, projects, education, and skills — the professional dimension of Hemanth Naga Sai Chakka.",
  );
  const read = useReadingProgress("professional");

  useEffect(() => {
    setDimension("professional");
    ensureFirstVisit();
    markVisited("professional");
    window.scrollTo(0, 0);
  }, [setDimension]);

  const current = professional.experience[0];
  const stints = parseStints(current?.sub) ?? [];
  const roles = current ? [{ role: current.role, period: current.period }, ...stints] : [];

  return (
    <main data-testid="professional-page">
      <RunningHead title="Professional" progress={read} backTestId="prof-back-link" scene="scene-cobalt" />

      {/* Opening — cobalt */}
      <section className="scene scene-cobalt">
        <div className="max-w-page mx-auto px-[var(--page-x)] pt-10 md:pt-16 pb-12 grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-8">
            <Slam
              as="h1"
              words={professional.heading}
              className="mega text-[clamp(3.5rem,10vw,8.5rem)]"
              wordClassName={(i) => (i === professional.heading.length - 1 ? "text-lime" : "")}
            />
            <blockquote className="lead text-[clamp(1.375rem,2.6vw,2rem)] mt-10 max-w-[32ch]" data-testid="prof-quote">
              {professional.quote}
            </blockquote>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:self-end flex flex-col gap-4">
            <PopIn rotate={2}>
              <div className="card fill-cream p-5">
                <dl className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-2.5 text-[0.9375rem]">
                  <dt className="font-semibold text-ink-soft">Role</dt>
                  <dd className="font-bold">{current?.role}</dd>
                  <dt className="font-semibold text-ink-soft">At</dt>
                  <dd className="font-bold">{current?.company}</dd>
                  <dt className="font-semibold text-ink-soft">Studied</dt>
                  <dd className="font-bold">{professional.education[0]?.degree.replace(" — ", ", ")}</dd>
                </dl>
              </div>
            </PopIn>
            <a
              href={`${BACKEND_URL}/api/resume/download`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="download-resume-btn"
              className="btn fill-lime justify-between text-lg !py-4"
            >
              Download résumé
              <span className="flex items-center gap-2 text-sm">
                PDF <Download size={18} strokeWidth={2.5} aria-hidden="true" />
              </span>
            </a>
          </div>
          <p className="col-span-12 lg:col-span-7 reading text-[var(--fg-soft)]">{professional.bio}</p>
        </div>
        <Marquee words={professional.heading.map((h) => h.replace(/\.$/, ""))} className="pb-6 mt-6" />
      </section>

      {/* Experience — cream */}
      <section className="scene scene-cream" aria-labelledby="experience-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          <SceneHead id="experience-head">
            Where I
            <span className="block">work.</span>
          </SceneHead>
          {professional.experience.map((e, i) => (
            <div key={i} className="mt-12 grid grid-cols-12 gap-6 md:gap-8" data-testid={`prof-experience-${i}`}>
              <div className="col-span-12 lg:col-span-5">
                <p className="lead text-2xl md:text-3xl mb-6">{e.company}</p>
                <div role="list" className="flex flex-col gap-4">
                  {roles.map((r, j) => (
                    <PopIn key={r.role} delay={j * 0.08}>
                      <div role="listitem" className={`card ${roleFills[j % roleFills.length]} p-4 md:p-5 flex items-start gap-3.5`}>
                        <span className="badge mt-0.5">{roles.length - j}</span>
                        <span>
                          <span className="block lead text-lg">{r.role}</span>
                          <span className="block text-sm font-semibold opacity-90 mt-0.5">{r.period}</span>
                        </span>
                      </div>
                    </PopIn>
                  ))}
                </div>
                {parseStints(e.sub) === null && <p className="mt-3 text-sm font-semibold">{e.sub}</p>}
              </div>
              <ul className="col-span-12 lg:col-span-7 flex flex-col gap-3 lg:pt-14">
                {e.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-3.5 reading">
                    <span className="mt-2 w-3 h-3 rounded-full bg-orange shrink-0" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects — ink */}
      <section className="scene scene-ink" aria-labelledby="projects-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          <SceneHead id="projects-head">
            Things I
            <span className="block text-orange">built.</span>
          </SceneHead>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-7">
            {professional.projects.map((p, i) => (
              <PopIn key={p.name} delay={i * 0.08} rotate={i % 2 ? 1 : -1}>
                <article className={`card ${projectFills[i % projectFills.length]} p-6 md:p-7 h-full`} data-testid={`prof-project-${i}`}>
                  <h3 className="mega text-[clamp(2rem,3.4vw,2.75rem)]">{p.name}</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.stack.split(" · ").map((t) => (
                      <span key={t} className="pill fill-ink text-xs !py-1.5">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="reading mt-6">{p.desc}</p>
                </article>
              </PopIn>
            ))}
          </div>
        </div>
      </section>

      {/* Education — cream */}
      <section className="scene scene-cream" aria-labelledby="education-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          <SceneHead id="education-head">
            What I
            <span className="block">studied.</span>
          </SceneHead>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {professional.education.map((e, i) => (
              <PopIn key={e.degree} delay={i * 0.08}>
                <article className={`card ${scoreFills[i % scoreFills.length]} p-6 h-full flex flex-col justify-between gap-8`} data-testid={`prof-education-${i}`}>
                  <Scramble text={e.meta} className="mega text-[clamp(2.5rem,4.5vw,3.5rem)] block" />
                  <span>
                    <span className="block lead text-lg">{e.degree}</span>
                    <span className="block font-semibold mt-1 opacity-90">
                      {e.org} · {e.period}
                    </span>
                  </span>
                </article>
              </PopIn>
            ))}
          </div>
        </div>
      </section>

      {/* Skills — lime */}
      <section className="scene scene-lime" aria-labelledby="skills-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] py-20 md:py-28">
          <SceneHead id="skills-head">
            What I
            <span className="block">use.</span>
          </SceneHead>
          <ul className="mt-12 flex flex-wrap gap-3">
            {professional.skills.map((s, i) => (
              <li key={s} data-testid={`prof-skill-${i}`}>
                <PopIn delay={i * 0.03} rotate={((i * 37) % 5) - 2}>
                  <span className="pill fill-ink text-base md:text-lg !px-5 !py-3">{s}</span>
                </PopIn>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Certifications + achievements — ink */}
      <section className="scene scene-ink" aria-labelledby="certs-head">
        <div className="max-w-page mx-auto px-[var(--page-x)] pt-20 md:pt-28 pb-36">
          <SceneHead id="certs-head">
            Proof,
            <span className="block text-lime">on paper.</span>
          </SceneHead>
          <div className="mt-12 grid grid-cols-12 gap-x-8 gap-y-12">
            <div className="col-span-12 lg:col-span-7">
              <h3 className="lead text-xl mb-5">Certifications</h3>
              <ul className="grid sm:grid-cols-2 gap-4">
                {certifications.map((c, i) => (
                  <li key={c.name} className="card fill-cream p-4" data-testid={`prof-cert-${i}`}>
                    <span className="block font-bold">{c.name}</span>
                    <span className="block text-sm font-semibold text-ink-soft mt-0.5">{c.org}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <h3 className="lead text-xl mb-5">Achievements</h3>
              <ul className="flex flex-col gap-4">
                {achievements.map((c, i) => (
                  <li key={c.name} className="card fill-orange p-4" data-testid={`prof-cert-${certifications.length + i}`}>
                    <span className="block font-bold">{c.name}</span>
                    <span className="block text-sm font-semibold mt-0.5">{c.org}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
