import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
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
  const [traces, setTraces] = useState<Trace[]>([]);
  const [status, setStatus] = useState<string>("");
  const [busyWord, setBusyWord] = useState<string | null>(null);

  useEffect(() => {
    setDimension("recruiter");
    document.documentElement.style.setProperty("--grain-opacity", "0");
    window.scrollTo(0, 0);
  }, [setDimension]);

  const loadTraces = async () => {
    setStatus("Loading…");
    try {
      const res = await axios.get<Trace[]>("/api/traces?limit=500");
      setTraces(res.data);
      setStatus(`${res.data.length} trace${res.data.length === 1 ? "" : "s"}`);
    } catch {
      setStatus("Failed to load traces.");
    }
  };

  useEffect(() => {
    loadTraces();
  }, []);

  const saveToken = (value: string) => {
    setToken(value);
    sessionStorage.setItem("lp_admin_token", value);
  };

  const deleteTrace = async (word: string) => {
    if (!token.trim()) {
      setStatus("Enter the admin token first.");
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
        setStatus("Unauthorized — check the admin token.");
      } else if (axios.isAxiosError(err) && err.response?.status === 404) {
        setStatus(`"${word}" was already gone.`);
        setTraces((prev) => prev.filter((t) => t.word !== word));
      } else {
        setStatus(`Failed to delete "${word}".`);
      }
    } finally {
      setBusyWord(null);
    }
  };

  return (
    <main className="recruiter-bg min-h-screen relative" data-testid="admin-page">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 relative">
        <div className="flex justify-between items-center mb-10 text-xs uppercase tracking-[0.2em] text-[#4B5563] font-plex">
          <Link to="/" className="inline-flex items-center gap-2 hover:text-black transition-colors" data-testid="admin-back-link">
            <ArrowLeft size={12} /> Full portfolio
          </Link>
          <span>Trace moderation</span>
        </div>

        <header className="pb-6 border-b border-[#E5E7EB]">
          <h1 className="font-plex font-semibold text-3xl text-[#111827] tracking-tight">
            Leave a Trace — Moderation
          </h1>
          <p className="font-plex text-sm text-[#4B5563] mt-2">
            Words visitors left on the Emotional page. Deleting requires the admin token.
          </p>
        </header>

        <section className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="password"
            value={token}
            onChange={(e) => saveToken(e.target.value)}
            placeholder="Admin token"
            autoComplete="off"
            className="px-3 py-2 text-sm font-plex border border-[#D1D5DB] rounded-lg bg-white text-[#111827] focus:outline-none focus:border-[#111827] w-64"
            data-testid="admin-token-input"
          />
          <button
            onClick={loadTraces}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-plex font-medium text-[#4B5563] border border-[#D1D5DB] rounded-lg hover:text-[#111827] hover:border-[#111827] transition-all"
            data-testid="admin-refresh-btn"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <span className="font-plex text-xs text-[#4B5563]" data-testid="admin-status">{status}</span>
        </section>

        <section className="mt-8 flex flex-wrap gap-2" data-testid="admin-trace-list">
          {traces.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 text-sm font-plex text-[#111827] border border-[#E5E7EB] bg-[#FAFAFA] rounded-full"
            >
              {t.word}
              <button
                onClick={() => deleteTrace(t.word)}
                disabled={busyWord === t.word}
                title={`Delete "${t.word}"`}
                className="p-1 rounded-full text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors disabled:opacity-40"
                data-testid={`admin-delete-${t.word}`}
              >
                <Trash2 size={13} />
              </button>
            </span>
          ))}
          {traces.length === 0 && (
            <p className="font-plex text-sm text-[#9CA3AF]">No traces yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
