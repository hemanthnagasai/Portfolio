import { useContext, useEffect } from "react";
import { Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { DimensionContext } from "@/context/DimensionContext";
import { professional } from "@/data/portfolio";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Recruiter() {
  const { setDimension } = useContext(DimensionContext);
  useEffect(() => {
    setDimension("recruiter");
    document.documentElement.style.setProperty("--grain-opacity", "0");
    window.scrollTo(0, 0);
  }, [setDimension]);

  return (
    <main className="recruiter-bg min-h-screen" data-testid="recruiter-page">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-10 text-xs uppercase tracking-[0.2em] text-[#4B5563] font-plex">
          <Link to="/" className="inline-flex items-center gap-2 hover:text-black" data-testid="recruiter-back-link">
            <ArrowLeft size={12} /> Full portfolio
          </Link>
          <span>Recruiter view</span>
        </div>

        {/* Header */}
        <header className="pb-6 border-b border-[#E5E7EB]">
          <h1 className="font-plex font-semibold text-4xl md:text-5xl text-[#111827] tracking-tight">
            Hemanth Naga Sai Chakka
          </h1>
          <p className="font-plex text-lg text-[#4B5563] mt-2">Senior Data Analyst · EY</p>
          <p className="font-plex text-sm text-[#4B5563] mt-3">
            Mangalagiri, Guntur · B.Tech CSE, KITS (CGPA 8.55)
          </p>
          <a
            href={`${BACKEND_URL}/api/resume/download`}
            target="_blank" rel="noopener noreferrer"
            data-testid="recruiter-download-btn"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[#111827] text-white text-sm font-plex font-medium rounded hover:bg-black transition-colors"
          >
            <Download size={14} /> Download Resume (PDF)
          </a>
        </header>

        {/* Summary */}
        <section className="py-8">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-3">Summary</h2>
          <p className="font-plex text-[15px] leading-relaxed text-[#111827]">
            Senior Data Analyst at EY working at the intersection of data, technology, and people.
            Translate complexity into clarity, automate repetitive workflows, and leverage GenAI to
            simplify complex findings for non-technical stakeholders.
          </p>
        </section>

        {/* Experience */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Experience</h2>
          {professional.experience.map((e, i) => (
            <div key={i} data-testid={`recruiter-exp-${i}`}>
              <div className="flex justify-between items-baseline">
                <p className="font-plex font-semibold text-[#111827]">{e.role} — {e.company}</p>
                <p className="font-plex text-sm text-[#4B5563]">{e.period}</p>
              </div>
              {e.sub && <p className="font-plex text-sm text-[#4B5563] italic mb-2">{e.sub}</p>}
              <ul className="mt-3 space-y-1.5">
                {e.bullets.map((b, j) => (
                  <li key={j} className="font-plex text-[14px] leading-relaxed text-[#111827] pl-4 relative">
                    <span className="absolute left-0 top-2 w-1 h-1 bg-[#111827] rounded-full" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Projects */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Projects</h2>
          {professional.projects.map((p, i) => (
            <div key={i} className="mb-5" data-testid={`recruiter-proj-${i}`}>
              <p className="font-plex font-semibold text-[#111827]">{p.name}</p>
              <p className="font-plex text-xs text-[#4B5563] italic mb-2">{p.stack}</p>
              <p className="font-plex text-[14px] leading-relaxed text-[#111827]">{p.desc}</p>
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-5">Education</h2>
          {professional.education.map((e, i) => (
            <div key={i} className="flex justify-between items-baseline mb-2" data-testid={`recruiter-edu-${i}`}>
              <div>
                <p className="font-plex font-medium text-[#111827]">{e.degree}</p>
                <p className="font-plex text-sm text-[#4B5563]">{e.org}</p>
              </div>
              <div className="text-right">
                <p className="font-plex text-sm text-[#4B5563]">{e.period}</p>
                <p className="font-plex text-sm font-medium text-[#111827]">{e.meta}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-4">Skills</h2>
          <p className="font-plex text-[14px] leading-relaxed text-[#111827]">
            {professional.skills.join(" · ")}
          </p>
        </section>

        {/* Certs */}
        <section className="py-8 border-t border-[#E5E7EB]">
          <h2 className="font-plex text-xs uppercase tracking-[0.2em] text-[#4B5563] mb-4">
            Certifications &amp; Achievements
          </h2>
          <ul className="space-y-1.5">
            {professional.certs.map((c, i) => (
              <li key={i} className="font-plex text-[14px] text-[#111827]" data-testid={`recruiter-cert-${i}`}>
                <span className="font-medium">{c.name}</span>
                <span className="text-[#4B5563]"> — {c.org}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="py-8 border-t border-[#E5E7EB] text-center">
          <p className="font-plex text-xs text-[#4B5563]">
            Full layered portfolio available at{" "}
            <Link to="/" className="underline hover:text-black">the Gateway</Link>.
          </p>
        </footer>
      </div>
    </main>
  );
}
