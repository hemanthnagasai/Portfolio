import { useEffect, useState } from "react";
import axios from "axios";
import { PopIn } from "@/components/kit/Kinetic";

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;
const SESSION_KEY = "trace_left";

interface Trace {
  id: string;
  word: string;
}

const wordFills = ["fill-orange", "fill-cobalt", "fill-lime", "fill-ink"];

// The guestbook: one word each, every word its own pill.
export default function LeaveATrace() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [word, setWord] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alreadyLeft, setAlreadyLeft] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );

  const fetchTraces = async () => {
    try {
      const res = await axios.get<Trace[]>(`${API}/traces?limit=120`);
      setTraces(res.data || []);
    } catch {
      // silent — guestbook is non-critical
    }
  };

  useEffect(() => {
    // Initial fetch; fetchTraces only sets state after its await, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTraces();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const w = word.trim();
    if (!w) return;
    if (!/^[A-Za-z'-]{1,24}$/.test(w)) {
      setError("One word, letters only.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post<Trace>(`${API}/traces`, { word: w });
      sessionStorage.setItem(SESSION_KEY, "1");
      setAlreadyLeft(true);
      setWord("");
      setTraces((t) => [res.data, ...t]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Couldn't accept that word. Try another, or try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="scene scene-cream" data-testid="leave-a-trace" aria-labelledby="trace-head">
      <div className="max-w-page mx-auto px-[var(--page-x)] pt-20 md:pt-28 pb-36">
        <h2 id="trace-head" className="mega text-[clamp(3rem,8vw,6.5rem)]">
          Leave one
          <span className="block text-cobalt">word.</span>
        </h2>
        <p className="lead text-[clamp(1.125rem,2vw,1.375rem)] mt-6 max-w-[32rem]">If something here found you.</p>

        {!alreadyLeft ? (
          <form onSubmit={submit} className="mt-10 flex flex-wrap items-center gap-3" data-testid="trace-form">
            <label className="flex-1 min-w-[12rem] max-w-[22rem]">
              <span className="sr-only">One word</span>
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="one word"
                maxLength={24}
                aria-invalid={!!error}
                className="w-full rounded-full border-[3px] border-ink bg-cream px-5 py-3 text-lg font-bold text-ink placeholder:text-ink-soft focus:outline-none focus:bg-lime transition-colors"
                data-testid="trace-input"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || !word.trim()}
              className="btn fill-ink"
              style={{ ["--card-shadow" as string]: "var(--orange)" } as React.CSSProperties}
              data-testid="trace-submit"
            >
              {submitting ? "Leaving it…" : "Leave it"}
            </button>
          </form>
        ) : (
          <p className="mt-10 pill fill-lime text-base" data-testid="trace-thanks">
            Thank you. Your word is among the others now.
          </p>
        )}

        {error && (
          <p className="mt-4 pill fill-ink text-sm" role="alert" data-testid="trace-error">
            {error}
          </p>
        )}

        <div className="mt-14" data-testid="trace-field">
          {traces.length === 0 ? (
            <p className="lead text-ink-soft">No words yet. Be the first to leave one.</p>
          ) : (
            <>
              <p className="lead text-ink-soft mb-5">
                {traces.length} {traces.length === 1 ? "word" : "words"} so far
              </p>
              <ul className="flex flex-wrap gap-2.5">
                {traces.map((t, i) => (
                  <li key={t.id || i} data-testid={`trace-dot-${i}`}>
                    <PopIn delay={Math.min(i, 24) * 0.025} rotate={((i * 53) % 7) - 3}>
                      <span className={`pill ${wordFills[i % wordFills.length]} text-base`}>{t.word}</span>
                    </PopIn>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
