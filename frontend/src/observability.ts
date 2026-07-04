// Optional, privacy-respecting instrumentation. BOTH are OFF by default and
// activate only when their env vars are set (see frontend/.env.example):
//
//   REACT_APP_SENTRY_DSN   — enables Sentry error tracking (dynamically
//                            imported, so it adds nothing to the bundle when
//                            unset).
//   REACT_APP_GOATCOUNTER  — enables GoatCounter analytics (cookieless, no
//                            personal data, no consent banner needed). Value
//                            is your counter URL, e.g.
//                            https://hemanth.goatcounter.com/count
//
// With neither set, this file is a no-op and loads no third-party code.

export function initObservability() {
  const dsn = import.meta.env.REACT_APP_SENTRY_DSN as string | undefined;
  if (dsn) {
    // Dynamic import keeps @sentry/react in its own chunk, fetched only when
    // a DSN is actually configured.
    import("@sentry/react")
      .then((Sentry) => {
        Sentry.init({
          dsn,
          environment: import.meta.env.MODE,
          tracesSampleRate: 0.1,
        });
      })
      .catch(() => {
        /* tracking is best-effort; never break the app over it */
      });
  }

  const goatcounter = import.meta.env.REACT_APP_GOATCOUNTER as string | undefined;
  if (goatcounter) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://gc.zgo.at/count.js";
    script.setAttribute("data-goatcounter", goatcounter);
    document.head.appendChild(script);
  }
}
