import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Table2 } from "lucide-react";
import type { Database, QueryExecResult } from "sql.js";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";
import portfolioData from "@/data/portfolio.json";
// Vite serves the wasm as a hashed asset from our own origin (CSP-friendly;
// script-src carries 'wasm-unsafe-eval' for the compile step).
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

// "Query my life": a real SQLite database, built in your browser from the
// same portfolio.json that renders this site — nothing leaves the page.
// It's your own private copy; even DROP TABLE only breaks it for you.

const SCHEMA: { table: string; columns: string[] }[] = [
  { table: "profile", columns: ["first_name", "middle_name", "last_name", "origin", "tagline"] },
  { table: "experience", columns: ["id", "company", "role", "period", "note"] },
  { table: "experience_bullets", columns: ["experience_id", "bullet"] },
  { table: "projects", columns: ["id", "name", "stack", "description"] },
  { table: "education", columns: ["id", "degree", "school", "period", "result"] },
  { table: "skills", columns: ["id", "skill"] },
  { table: "certifications", columns: ["id", "name", "org"] },
  { table: "hobbies", columns: ["id", "hobby", "note"] },
  { table: "life_values", columns: ["id", "value"] },
];

const EXAMPLES: { label: string; sql: string }[] = [
  { label: "Who is this?", sql: "SELECT * FROM profile;" },
  { label: "The day job", sql: "SELECT role, company, period FROM experience;" },
  {
    label: "What he actually does",
    sql: "SELECT b.bullet\nFROM experience_bullets b\nJOIN experience e ON e.id = b.experience_id\nWHERE e.company LIKE '%Young%';",
  },
  { label: "Skill count", sql: "SELECT COUNT(*) AS skills FROM skills;" },
  {
    label: "Life outside work",
    sql: "SELECT hobby, note FROM hobbies ORDER BY hobby;",
  },
  {
    label: "Everything at once",
    sql: "SELECT 'skills' AS what, COUNT(*) AS n FROM skills\nUNION ALL SELECT 'projects', COUNT(*) FROM projects\nUNION ALL SELECT 'certifications', COUNT(*) FROM certifications\nUNION ALL SELECT 'values', COUNT(*) FROM life_values;",
  },
];

function buildDatabase(SQL: { Database: new () => Database }): Database {
  const db = new SQL.Database();
  const { profile, professional, personal } = portfolioData;

  db.run(`
    CREATE TABLE profile (first_name TEXT, middle_name TEXT, last_name TEXT, origin TEXT, tagline TEXT);
    CREATE TABLE experience (id INTEGER PRIMARY KEY, company TEXT, role TEXT, period TEXT, note TEXT);
    CREATE TABLE experience_bullets (experience_id INTEGER, bullet TEXT);
    CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT, stack TEXT, description TEXT);
    CREATE TABLE education (id INTEGER PRIMARY KEY, degree TEXT, school TEXT, period TEXT, result TEXT);
    CREATE TABLE skills (id INTEGER PRIMARY KEY, skill TEXT);
    CREATE TABLE certifications (id INTEGER PRIMARY KEY, name TEXT, org TEXT);
    CREATE TABLE hobbies (id INTEGER PRIMARY KEY, hobby TEXT, note TEXT);
    CREATE TABLE life_values (id INTEGER PRIMARY KEY, value TEXT);
  `);

  db.run("INSERT INTO profile VALUES (?,?,?,?,?)", [
    profile.firstName,
    profile.middleName,
    profile.lastName,
    profile.origin,
    profile.tagline,
  ]);

  professional.experience.forEach((e, i) => {
    db.run("INSERT INTO experience VALUES (?,?,?,?,?)", [
      i + 1,
      e.company,
      e.role,
      e.period,
      e.sub ?? null,
    ]);
    e.bullets.forEach((b) => db.run("INSERT INTO experience_bullets VALUES (?,?)", [i + 1, b]));
  });

  professional.projects.forEach((p, i) =>
    db.run("INSERT INTO projects VALUES (?,?,?,?)", [i + 1, p.name, p.stack, p.desc]),
  );
  professional.education.forEach((e, i) =>
    db.run("INSERT INTO education VALUES (?,?,?,?,?)", [i + 1, e.degree, e.org, e.period, e.meta]),
  );
  professional.skills.forEach((s, i) => db.run("INSERT INTO skills VALUES (?,?)", [i + 1, s]));
  professional.certs.forEach((c, i) =>
    db.run("INSERT INTO certifications VALUES (?,?,?)", [i + 1, c.name, c.org]),
  );
  personal.hobbies.forEach((h, i) =>
    db.run("INSERT INTO hobbies VALUES (?,?,?)", [i + 1, h.title, h.note]),
  );
  personal.values.forEach((v, i) => db.run("INSERT INTO life_values VALUES (?,?)", [i + 1, v]));

  return db;
}

export default function Query() {
  const { setDimension } = useContext(DimensionContext);
  usePageMeta(
    "Query My Life — Hemanth Naga Sai Chakka",
    "A real SQLite database of Hemanth's life, running entirely in your browser. SELECT away.",
  );

  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sqlText, setSqlText] = useState<string>(EXAMPLES[0].sql);
  const [results, setResults] = useState<QueryExecResult[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    setDimension("professional");
    document.documentElement.style.setProperty("--grain-opacity", "0.04");
    window.scrollTo(0, 0);
  }, [setDimension]);

  useEffect(() => {
    let cancelled = false;
    import("sql.js")
      .then((mod) => mod.default({ locateFile: () => sqlWasmUrl }))
      .then((SQL) => {
        if (cancelled) return;
        dbRef.current = buildDatabase(SQL);
        setReady(true);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setLoadError("The in-browser database couldn't start here. It needs WebAssembly — try a current browser.");
      });
    return () => {
      cancelled = true;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  const runQuery = (text?: string) => {
    const db = dbRef.current;
    const sql = (text ?? sqlText).trim();
    if (!db || !sql) return;
    // eslint-disable-next-line react-hooks/purity -- runQuery is an event handler, not render
    const t0 = performance.now();
    try {
      const res = db.exec(sql);
      setResults(res);
      setQueryError(null);
      // eslint-disable-next-line react-hooks/purity -- see above
      setElapsed(performance.now() - t0);
    } catch (e) {
      setQueryError(e instanceof Error ? e.message : String(e));
      setResults(null);
      setElapsed(null);
    }
  };

  const runExample = (sql: string) => {
    setSqlText(sql);
    runQuery(sql);
  };

  return (
    <main
      className="min-h-screen relative"
      style={{ background: "var(--bg-void)", color: "#f0f0f5" }}
      data-testid="query-page"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 relative">
        <div className="flex justify-between items-center mb-12 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:text-white/60 transition-colors"
            data-testid="query-back-link"
          >
            <ArrowLeft size={11} /> Gateway
          </Link>
          <span className="text-[#00E5FF]/70">sqlite · in your browser · nothing leaves the page</span>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-heading text-4xl md:text-5xl tracking-tight text-[#f5f2ff]">
            Query my life<span className="text-[#00E5FF]">_</span>
          </h1>
          <p className="font-outfit text-white/60 mt-4 max-w-[62ch] leading-relaxed">
            I'm a data analyst — a page of adjectives felt wrong. So here's the data instead: a
            real SQLite database of my work, education, skills, and life, running entirely in your
            browser. It's your own private copy; even <code className="font-mono text-[13px] text-[#00E5FF]/80">DROP TABLE</code> only
            breaks it for you.
          </p>
        </motion.header>

        <div className="mt-10 grid md:grid-cols-[1fr_230px] gap-6 items-start">
          {/* Console */}
          <div>
            {/* Example chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex.label}
                  onClick={() => runExample(ex.sql)}
                  disabled={!ready}
                  className="font-mono text-[11px] px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/40"
                  data-testid={`query-example-${i}`}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-[#07070e] overflow-hidden focus-within:border-[#00E5FF]/40 transition-colors">
              <textarea
                value={sqlText}
                onChange={(e) => setSqlText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    runQuery();
                  }
                }}
                spellCheck={false}
                rows={5}
                aria-label="SQL query"
                className="w-full bg-transparent font-mono text-[13px] leading-relaxed text-[#d6f6ff] p-4 resize-y focus:outline-none placeholder:text-white/50"
                placeholder="SELECT * FROM skills;"
                data-testid="query-input"
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 bg-white/[0.02]">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  {ready ? "Ctrl+Enter to run" : loadError ? "unavailable" : "loading database…"}
                </span>
                <button
                  onClick={() => runQuery()}
                  disabled={!ready || !sqlText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs uppercase tracking-[0.15em] bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/50"
                  data-testid="query-run"
                >
                  <Play size={12} /> Run
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="mt-5" aria-live="polite">
              {loadError && (
                <p className="font-mono text-sm text-red-400/80 border border-red-400/20 rounded-lg p-4" data-testid="query-load-error">
                  {loadError}
                </p>
              )}
              {queryError && (
                <p className="font-mono text-[13px] text-red-400/90 border border-red-400/20 bg-red-400/5 rounded-lg p-4" data-testid="query-error">
                  {queryError}
                </p>
              )}
              {results && results.length === 0 && !queryError && (
                <p className="font-mono text-[12px] text-white/60 p-1" data-testid="query-empty">
                  ok — no rows returned{elapsed !== null ? ` · ${elapsed.toFixed(1)}ms` : ""}
                </p>
              )}
              {results?.map((res, ri) => (
                <div key={ri} className="mb-6" data-testid="query-results">
                  <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full font-mono text-[12.5px]">
                      <thead>
                        <tr className="bg-[#00E5FF]/[0.06] text-[#00E5FF]/80">
                          {res.columns.map((c) => (
                            <th key={c} className="text-left px-3.5 py-2.5 font-medium whitespace-nowrap border-b border-white/10">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {res.values.map((row, i) => (
                          <tr key={i} className="odd:bg-white/[0.015] align-top">
                            {row.map((cell, j) => (
                              <td key={j} className="px-3.5 py-2.5 text-white/70 border-b border-white/5 min-w-[80px] max-w-[420px]">
                                {cell === null ? <span className="text-white/50">NULL</span> : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="font-mono text-[10px] text-white/50 mt-2 uppercase tracking-[0.15em]">
                    {res.values.length} row{res.values.length === 1 ? "" : "s"}
                    {elapsed !== null && ri === results.length - 1 ? ` · ${elapsed.toFixed(1)}ms` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Schema panel */}
          <aside className="rounded-lg border border-white/10 bg-[#07070e] p-4 md:sticky md:top-6" data-testid="query-schema">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3 flex items-center gap-2">
              <Table2 size={11} /> Schema
            </h2>
            <ul className="space-y-3">
              {SCHEMA.map((t) => (
                <li key={t.table}>
                  <button
                    onClick={() => runExample(`SELECT * FROM ${t.table};`)}
                    disabled={!ready}
                    className="font-mono text-[12px] text-[#00E5FF]/70 hover:text-[#00E5FF] transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/40 rounded"
                    title={`SELECT * FROM ${t.table};`}
                  >
                    {t.table}
                  </button>
                  <p className="font-mono text-[10px] text-white/50 leading-relaxed mt-0.5">
                    {t.columns.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 flex gap-6 flex-wrap">
          <Link to="/how-i-built-this" className="hover:text-white/80 transition-colors">
            How this site was built →
          </Link>
          <Link to="/professional" className="hover:text-white/80 transition-colors">
            The human-readable version →
          </Link>
        </footer>
      </div>
    </main>
  );
}
