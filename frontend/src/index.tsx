import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { initObservability } from "@/observability";

// No-op unless REACT_APP_SENTRY_DSN / REACT_APP_GOATCOUNTER are set.
initObservability();

// The Google Fonts stylesheet ships with media="print" so it never blocks
// first paint (see index.html). Flipping it to "all" here applies the fonts;
// the browser swaps them in whenever the stylesheet finishes loading. Done
// here instead of an inline onload handler, which CSP (script-src 'self')
// would block.
document
  .querySelectorAll<HTMLLinkElement>("link[data-async-font]")
  .forEach((link) => {
    link.media = "all";
  });

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
