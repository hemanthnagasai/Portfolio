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
