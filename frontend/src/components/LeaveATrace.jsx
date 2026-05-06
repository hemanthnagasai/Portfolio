import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const SESSION_KEY = "trace_left";

function deterministicPos(seed) {
  // simple hash → [0..1)
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const x = Math.abs(Math.sin(h)) % 1;
  const y = Math.abs(Math.cos(h * 1.7)) % 1;
  return { x, y };
}

export default function LeaveATrace() {
  const [traces, setTraces] = useState([]);
  const [word, setWord] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState(null);
  const [alreadyLeft, setAlreadyLeft] = useState(false);

  useEffect(() => {
    setAlreadyLeft(sessionStorage.getItem(SESSION_KEY) === "1");
    fetchTraces();
  }, []);

  const fetchTraces = async () => {
    try {
      const res = await axios.get(`${API}/traces?limit=120`);
      setTraces(res.data || []);
    } catch (e) {
      // silent — guestbook is non-critical
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const w = word.trim();
    if (!w) return;
    if (!/^[A-Za-z'\-]{1,24}$/.test(w)) {
      setError("One word, letters only.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/traces`, { word: w });
      sessionStorage.setItem(SESSION_KEY, "1");
      setAlreadyLeft(true);
      setWord("");
      setTraces((t) => [res.data, ...t]);
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't accept that word.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="relative z-10 px-6 md:px-10 max-w-3xl mx-auto pb-32 md:pb-44"
      data-testid="leave-a-trace"
    >
      <div className="border-t border-[#FFB703]/20 pt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#FFB703]/70 mb-5 text-center">
          Trace
        </p>
        <p className="font-playfair italic text-2xl md:text-3xl text-white text-center leading-relaxed">
          If something here found you,<br />
          leave one word.
        </p>

        {!alreadyLeft ? (
          <form
            onSubmit={submit}
            className="mt-10 flex items-center justify-center gap-3"
            data-testid="trace-form"
          >
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="one word"
              maxLength={24}
              className="bg-transparent border-b border-[#FFB703]/40 focus:border-[#FFB703] outline-none px-2 py-2 text-center font-spectral italic text-white text-lg w-44 placeholder:text-white/30"
              data-testid="trace-input"
            />
            <button
              type="submit"
              disabled={submitting || !word.trim()}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFB703] border border-[#FFB703]/40 px-4 py-2 rounded-full hover:bg-[#FFB703]/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              data-testid="trace-submit"
            >
              Leave it
            </button>
          </form>
        ) : (
          <p
            className="mt-10 text-center font-spectral italic text-white/60"
            data-testid="trace-thanks"
          >
            Thank you. Your word is among the others now.
          </p>
        )}

        {error && (
          <p className="mt-3 text-center text-xs text-[#FFB703]/80" data-testid="trace-error">
            {error}
          </p>
        )}

        {/* Starfield of words */}
        <div
          className="relative mt-14 h-[260px] md:h-[320px] w-full rounded-sm overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,183,3,0.06), transparent 70%)",
          }}
          data-testid="trace-field"
        >
          {traces.map((t, i) => {
            const { x, y } = deterministicPos(t.id || String(i));
            const px = 6 + x * 88;
            const py = 8 + y * 84;
            const isHovered = hovered === t.id;
            return (
              <motion.button
                key={t.id || i}
                type="button"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 1.2, delay: (i % 18) * 0.06, ease: "easeOut" }}
                whileHover={{ opacity: 1, scale: 1.4 }}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "absolute",
                  left: `${px}%`,
                  top: `${py}%`,
                  width: 6,
                  height: 6,
                  borderRadius: "9999px",
                  background: "#FFB703",
                  boxShadow: "0 0 10px #FFB703, 0 0 20px rgba(255,183,3,0.5)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                data-testid={`trace-dot-${i}`}
              >
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute left-1/2 -translate-x-1/2 top-4 whitespace-nowrap font-spectral italic text-sm text-white px-2 py-1 rounded bg-black/70 border border-[#FFB703]/30"
                    >
                      {t.word}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
          {traces.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center font-spectral italic text-white/30 text-sm">
              be the first to leave a word.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
