// Adaptive Visitor Mode — persona selection + per-mode copy
export const MODES = [
  { key: "recruiter",  label: "Recruiter",        glyph: "01" },
  { key: "friend",     label: "Friend",           glyph: "02" },
  { key: "stranger",   label: "Stranger",         glyph: "03" },
  { key: "someone",    label: "Someone special",  glyph: "04" },
];

export const MODE_COPY = {
  recruiter: {
    headline: "Welcome. Let's keep this efficient.",
    subline:  "The Professional world is straight ahead. Resume one click away.",
    portalOrder: ["Professional", "Personal", "Emotional"],
  },
  friend: {
    headline: "You showed up. Glad it's you.",
    subline:  "Personal world is where I actually live. Start there.",
    portalOrder: ["Personal", "Professional", "Emotional"],
  },
  stranger: {
    headline: "A man who reveals himself in layers.",
    subline:  "Choose a world to begin. No wrong door.",
    portalOrder: ["Professional", "Personal", "Emotional"],
  },
  someone: {
    headline: "There's a letter for you. Take your time.",
    subline:  "Some pages aren't for everyone. The Emotional world is the one that matters most.",
    portalOrder: ["Emotional", "Personal", "Professional"],
  },
};

const KEY = "visitor_mode";

export function getVisitorMode() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setVisitorMode(mode) {
  try {
    sessionStorage.setItem(KEY, mode);
  } catch {
    /* noop */
  }
}
