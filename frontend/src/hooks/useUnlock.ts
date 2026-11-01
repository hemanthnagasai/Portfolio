// Tracks visitor session for the Layer Zero easter egg.
// Unlocks when EITHER:
//   - 90+ seconds elapsed since first visit (this browser), OR
//   - All three worlds (professional, personal, emotional) have been visited.
import { useEffect, useState } from "react";

const KEY_FIRST = "lp_first_visit_ts";
const KEY_VISITED = "lp_visited_worlds";
const UNLOCK_AFTER_MS = 90 * 1000;

export function markVisited(world: string) {
  try {
    const cur = JSON.parse(localStorage.getItem(KEY_VISITED) || "[]") as string[];
    if (!cur.includes(world)) {
      cur.push(world);
      localStorage.setItem(KEY_VISITED, JSON.stringify(cur));
    }
  } catch {
    /* noop */
  }
}

export function ensureFirstVisit() {
  try {
    if (!localStorage.getItem(KEY_FIRST)) {
      localStorage.setItem(KEY_FIRST, String(Date.now()));
    }
  } catch {
    /* noop */
  }
}

export function isUnlocked(): boolean {
  try {
    const visited = JSON.parse(localStorage.getItem(KEY_VISITED) || "[]") as string[];
    if (
      visited.includes("professional") &&
      visited.includes("personal") &&
      visited.includes("emotional")
    ) {
      return true;
    }
    const first = parseInt(localStorage.getItem(KEY_FIRST) || "0", 10);
    if (first && Date.now() - first >= UNLOCK_AFTER_MS) return true;
  } catch {
    /* noop */
  }
  return false;
}

// Hook for components — re-checks every 4s.
export default function useUnlock(): boolean {
  const [unlocked, setUnlocked] = useState<boolean>(() => isUnlocked());
  useEffect(() => {
    ensureFirstVisit();
    const i = setInterval(() => {
      setUnlocked(isUnlocked());
    }, 4000);
    return () => clearInterval(i);
  }, []);
  return unlocked;
}

// ─── Reading progress ───────────────────────────────────────────────
// How much of each world a visitor has actually read, in sixths (one
// "over"). The Gateway pencils this back into its table, so the book
// only ever records what really happened.
const KEY_PROGRESS = "lp_read_progress";
export const OVER = 6;

export function getProgress(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY_PROGRESS) || "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function recordProgress(world: string, balls: number) {
  try {
    const cur = getProgress();
    if ((cur[world] || 0) < balls) {
      cur[world] = balls;
      localStorage.setItem(KEY_PROGRESS, JSON.stringify(cur));
    }
  } catch {
    /* noop */
  }
}

// Tracks how far down the current page the reader has seen, as 0–6.
// Never goes backwards: scrolling up doesn't un-read anything.
export function useReadingProgress(world: string): number {
  const [balls, setBalls] = useState(() => getProgress()[world] || 0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const seen = (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      const next = Math.min(OVER, Math.floor(seen * OVER + 0.02));
      recordProgress(world, next);
      setBalls((b) => Math.max(b, next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // Let the page lay out (fonts, images) before the first reading.
    const t = setTimeout(measure, 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(t);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [world]);
  return balls;
}

export function getVisited(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_VISITED) || "[]") as string[];
  } catch {
    return [];
  }
}
