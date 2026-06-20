/** Cinematic animation presets for the portfolio. */

/** Default enter: fade up with ease */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

/** Cinematic reveal: blur + scale + slight 3D rotation */
export const cinematicReveal = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)", scale: 0.96, rotateX: 4 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    rotateX: 0,
    transition: { duration: 1.2, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

/** Film frame entrance: slide from right with perspective skew */
export const filmFrameEnter = {
  hidden: { opacity: 0, x: 60, rotateY: -8 },
  show: (i = 0) => ({
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

/** Focus pull: simulated camera rack-focus */
export const focusPull = {
  hidden: { opacity: 0, filter: "blur(12px)", scale: 1.04 },
  show: (i = 0) => ({
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 1.6, delay: i * 0.1, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

/** Stagger container for children */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

/** Glow pulse variant for looping elements */
export const glowPulseVariant = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};
