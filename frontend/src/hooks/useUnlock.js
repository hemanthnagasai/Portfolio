// Tracks visitor session for the Layer Zero easter egg.
// Unlocks when EITHER:
//   - 90+ seconds elapsed since first visit (this browser), OR
//   - All three worlds (professional, personal, emotional) have been visited.
import { useEffect, useState } from "react";

const KEY_FIRST = "lp_first_visit_ts";
const KEY_VISITED = "lp_visited_worlds";
const UNLOCK_AFTER_MS = 90 * 1000;

export function markVisited(world) {
  try {
    const cur = JSON.parse(localStorage.getItem(KEY_VISITED) || "[]");
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

export function isUnlocked() {
  try {
    const visited = JSON.parse(localStorage.getItem(KEY_VISITED) || "[]");
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
export default function useUnlock() {
  const [unlocked, setUnlocked] = useState(() => isUnlocked());
  useEffect(() => {
    ensureFirstVisit();
    const i = setInterval(() => {
      setUnlocked(isUnlocked());
    }, 4000);
    return () => clearInterval(i);
  }, []);
  return unlocked;
}
