// Time-aware greeting generator. Returns one of several
// thoughtful taglines based on the visitor's local time + day.
export function getGreeting() {
  const now = new Date();
  const h = now.getHours();
  const day = now.getDay(); // 0 = Sunday

  if (day === 0) {
    return "Sundays are for unfolding. Stay a while.";
  }
  if (h >= 23 || h < 5) {
    return "Up late too. Same.";
  }
  if (h >= 5 && h < 11) {
    return "Caught me before the day. Welcome.";
  }
  if (h >= 11 && h < 17) {
    return "Pull up a chair. The afternoon is yours.";
  }
  if (h >= 17 && h < 20) {
    return "Golden hour. The best time to be honest.";
  }
  // 20–23
  return "Evenings make people honest. Welcome in.";
}

// Always-on subline (the original tagline kept as second line)
export const SUBLINE = "A man who reveals himself in layers. Choose a world to begin.";
