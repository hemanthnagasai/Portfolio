import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";

interface Trace {
  id: string;
  word: string;
}

// Moderation console for the "Leave a Trace" guestbook. The page itself is
// public (nothing here is secret), but every delete goes through the
// backend's X-Admin-Token check — without the token this is read-only,
// exactly like GET /api/traces.
export default function Admin() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta("Trace Moderation — Admin");

  const [token, setToken] = useState<string>(() => sessionStorage.getItem("lp_admin_token") || "");
  const [showToken, setShowToken] = useState(false);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<string>("");
  const [busyWord, setBusyWord] = useState<string | null>(null);

  useEffect(() => {
    setDimension("recruiter");
    window.scrollTo(0, 0);
  }, [setDimension]);

  const loadTraces = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get<Trace[]>("/api/traces?limit=500");
      setTraces(res.data);
      setStatus("");
    } catch {
      setStatus("Couldn't load traces — is the backend up?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch; isLoading already starts true so the sync setIsLoading(true) is a no-op here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTraces();
  }, []);

  const saveToken = (value: string) => {
    setToken(value);
    sessionStorage.setItem("lp_admin_token", value);
  };

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return traces;
    return traces.filter((t) => t.word.toLowerCase().includes(q));
  }, [traces, filter]);

  const deleteTrace = async (word: string) => {
    if (!token.trim()) {
      setStatus("Enter the admin token first — deletes are locked without it.");
      return;
    }
    setBusyWord(word);
    try {
      await axios.delete(`/api/traces/${encodeURIComponent(word)}`, {
        headers: { "X-Admin-Token": token.trim() },
      });
      setTraces((prev) => prev.filter((t) => t.word !== word));
      setStatus(`Deleted "${word}".`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setStatus("Unauthorized — that token isn't right.");
      } else if (axios.isAxiosError(err) && err.response?.status === 404) {
        setStatus(`"${word}" was already gone.`);
        setTraces((prev) => prev.filter((t) => t.word !== word));
      } else {
        setStatus(`Couldn't delete "${word}" — try again.`);
      }
    } finally {
      setBusyWord(null);
    }
  };

  return (
    <main className="recruiter-bg min-h-screen relative" data-testid="admin-page">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 relative">
        <div className="flex justify-between items-center mb-10 text-sm text-ink-soft">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:text-ink transition-colors"
            data-testid="admin-back-link"
          >
            <ArrowLeft size={12} /> Full portfolio
          </Link>
          <span>Trace moderation</span>
        </div>

        <header className="pb-6 border-b border-line">
          <h1 className="font-semibold text-3xl text-ink tracking-tight">
            Leave a Trace — Moderation
          </h1>
          <p className="text-sm text-ink-soft mt-2 max-w-[65ch]">
            Words visitors left on the Emotional page, newest first. Deleting requires the admin
            token; everything else here is read-only.
          </p>
        </header>

        {/* Controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadTraces();
          }}
          className="mt-6 flex flex-wrap items-center gap-3"
        >
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => saveToken(e.target.value)}
              placeholder="Admin token"
              autoComplete="off"
              spellCheck={false}
              aria-label="Admin token"
              className="pl-3 pr-10 py-2 text-base sm:text-sm border border-line bg-cream text-ink placeholder:text-ink-soft focus:border-ink transition-colors w-64"
              data-testid="admin-token-input"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              aria-label={showToken ? "Hide token" : "Show token"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-ink-soft hover:text-ink transition-colors"
            >
              {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-ink-soft border border-line hover:text-ink hover:border-ink transition-colors disabled:opacity-50"
            data-testid="admin-refresh-btn"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin motion-reduce:animate-none" : ""} />
            Refresh
          </button>
          <span className="text-xs text-ink-soft" role="status" aria-live="polite" data-testid="admin-status">
            {status}
          </span>
        </form>

        {/* Filter + count */}
        <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter words"
              aria-label="Filter traces"
              className="pl-[2.125rem] pr-3 py-2 text-base sm:text-sm border border-line bg-cream text-ink placeholder:text-ink-soft focus:border-ink transition-colors w-56"
              data-testid="admin-filter-input"
            />
          </div>
          {!isLoading && (
            <p className="text-xs text-ink-soft tabular-nums" data-testid="admin-count">
              {filter.trim()
                ? `${visible.length} of ${traces.length} trace${traces.length === 1 ? "" : "s"}`
                : `${traces.length} trace${traces.length === 1 ? "" : "s"}`}
            </p>
          )}
        </div>

        {/* Traces */}
        <section className="mt-4 flex flex-wrap gap-2" data-testid="admin-trace-list">
          {isLoading ? (
            // Skeleton chips: same shape as the real thing, so nothing jumps.
            [64, 88, 72, 96, 56, 80, 104, 68].map((w, i) => (
              <span
                key={i}
                className="h-[34px] bg-line/70 animate-pulse motion-reduce:animate-none"
                style={{ width: w }}
                aria-hidden="true"
              />
            ))
          ) : visible.length > 0 ? (
            visible.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 text-sm text-ink border border-line bg-cream hover:border-line transition-colors"
              >
                {t.word}
                <button
                  onClick={() => deleteTrace(t.word)}
                  disabled={busyWord !== null}
                  title={`Delete "${t.word}"`}
                  aria-label={`Delete "${t.word}"`}
                  className="p-1.5 text-ink-soft hover:text-orange hover:bg-orange/15 transition-colors disabled:opacity-40"
                  data-testid={`admin-delete-${t.word}`}
                >
                  {busyWord === t.word ? (
                    <Loader2 size={13} className="animate-spin motion-reduce:animate-none" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </span>
            ))
          ) : traces.length > 0 ? (
            <p className="text-sm text-ink-soft">
              Nothing matches “{filter.trim()}”.{" "}
              <button
                onClick={() => setFilter("")}
                className="underline underline-offset-2 hover:text-ink transition-colors"
              >
                Clear filter
              </button>
            </p>
          ) : (
            <p className="text-sm text-ink-soft">
              No traces yet — they'll appear here as visitors leave words on the Emotional page.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
