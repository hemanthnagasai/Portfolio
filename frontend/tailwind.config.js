/** @type {import('tailwindcss').Config} */
// The reel palette: tokens live as CSS custom properties in src/index.css
// and are exposed here so utilities and hand-written CSS share one palette.
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        ink: "var(--ink)",
        orange: "var(--orange)",
        cobalt: "var(--cobalt)",
        lime: "var(--lime)",
        "ink-soft": "var(--ink-soft)",
        "cream-soft": "var(--cream-soft)",
        line: "var(--line)",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        telugu: ['"Anek Telugu"', '"Inter"', "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      maxWidth: {
        page: "80rem",
        prose: "38rem",
      },
      borderRadius: {
        card: "1.125rem",
      },
    },
  },
  plugins: [],
};
