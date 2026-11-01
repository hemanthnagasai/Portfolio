import { professional, personal, emotional } from "@/data/portfolio";

const WPM = 200;

function words(...parts: (string | string[] | undefined)[]): number {
  return parts
    .flat()
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

const minutes = (n: number) => Math.max(1, Math.round(n / WPM));

// Honest reading times, counted from the same data the pages render.
export const readMinutes: Record<string, number> = {
  professional: minutes(
    words(
      professional.quote,
      professional.bio,
      professional.experience.flatMap((e) => e.bullets),
      professional.projects.map((p) => p.desc),
      professional.education.map((e) => `${e.degree} ${e.org}`),
      professional.skills,
      professional.certs.map((c) => c.name),
    ),
  ),
  personal: minutes(
    words(
      personal.quote,
      personal.bio,
      personal.hobbies.map((h) => h.note),
      personal.values,
      personal.closing,
    ),
  ),
  emotional: minutes(words(emotional.paragraphs)),
};

export interface Stint {
  role: string;
  period: string;
}

// "Senior Data Analyst · Dec 2025 — Oct 2026 · Intern · Jun 2025 — Dec 2025"
// becomes one row per earlier role. Anything that doesn't pair up cleanly
// is returned as null so the page can fall back to the raw line.
export function parseStints(sub?: string): Stint[] | null {
  if (!sub) return [];
  const parts = sub.split(" · ").map((s) => s.trim());
  if (parts.length % 2 !== 0) return null;
  const out: Stint[] = [];
  for (let i = 0; i < parts.length; i += 2) out.push({ role: parts[i], period: parts[i + 1] });
  return out;
}
