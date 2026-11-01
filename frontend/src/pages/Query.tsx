import { useContext, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Database, QueryExecResult } from "sql.js";
import { DimensionContext } from "@/context/DimensionContext";
import usePageMeta from "@/hooks/usePageMeta";
import portfolioData from "@/data/portfolio.json";
import Leaf from "@/components/kit/Leaf";
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
    <Leaf
      title="Query my life"
      heading={["Query", "my life."]}
      intro={
        <>
          I'm a consultant — a page of adjectives felt wrong. So here's the data instead: a real
          SQLite database of my work, education, skills, and life, running entirely in your
          browser. It's your own private copy; even <code className="font-mono text-[0.85em] bg-ink text-lime rounded-md px-1.5">DROP TABLE</code> only
          breaks it for you.
        </>
      }
      note="SQLite, in your browser. Nothing leaves the page."
      testId="query-page"
      backTestId="query-back-link"
      wide
      footer={[
        { to: "/how-i-built-this", label: "How this site was built" },
        { to: "/professional", label: "The human-readable version" },
      ]}
    >
      <div className="grid md:grid-cols-[1fr_15rem] gap-x-10 gap-y-10 items-start">
        {/* Console */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 mb-4">
            {EXAMPLES.map((ex, i) => (
              <button
                key={ex.label}
                onClick={() => runExample(ex.sql)}
                disabled={!ready}
                className="pill fill-cream border-[3px] border-ink text-sm hover:bg-lime transition-colors disabled:opacity-40"
                data-testid={`query-example-${i}`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div className="card fill-ink overflow-hidden focus-within:outline focus-within:outline-[3px] focus-within:outline-ink focus-within:outline-offset-4" style={{ ["--card-shadow" as string]: "var(--orange)" } as React.CSSProperties}>
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
              className="block w-full bg-transparent font-mono text-[0.9375rem] leading-relaxed text-lime p-5 resize-y focus:outline-none placeholder:text-cream-soft"
              placeholder="SELECT * FROM skills;"
              data-testid="query-input"
            />
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#262626]">
              <span className="text-sm font-semibold text-cream-soft">
                {ready ? "Ctrl+Enter to run" : loadError ? "Unavailable" : "Loading the database…"}
              </span>
              <button
                onClick={() => runQuery()}
                disabled={!ready || !sqlText.trim()}
                className="pill fill-lime text-sm hover:bg-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="query-run"
              >
                <Play size={13} strokeWidth={2} aria-hidden="true" /> Run
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="mt-6" aria-live="polite">
            {loadError && (
              <p className="pill fill-orange text-sm" data-testid="query-load-error">
                {loadError}
              </p>
            )}
            {queryError && (
              <p className="card fill-orange font-mono text-[0.8125rem] p-4" data-testid="query-error">
                {queryError}
              </p>
            )}
            {results && results.length === 0 && !queryError && (
              <p className="text-sm font-semibold text-ink-soft" data-testid="query-empty">
                Ran fine, no rows returned{elapsed !== null ? ` · ${elapsed.toFixed(1)} ms` : ""}
              </p>
            )}
            {results?.map((res, ri) => (
              <div key={ri} className="mb-8" data-testid="query-results">
                <div className="overflow-x-auto">
                  <table className="data-table font-mono text-[0.8125rem]">
                    <thead>
                      <tr>
                        {res.columns.map((c) => (
                          <th key={c} className="font-sans whitespace-nowrap">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {res.values.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="min-w-[5rem] max-w-[26rem]">
                              {cell === null ? <span className="text-ink-soft">NULL</span> : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm font-semibold text-ink-soft mt-2">
                  {res.values.length} row{res.values.length === 1 ? "" : "s"}
                  {elapsed !== null && ri === results.length - 1 ? ` · ${elapsed.toFixed(1)} ms` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Schema */}
        <aside className="md:sticky md:top-20" data-testid="query-schema">
          <h2 className="lead text-xl mb-2">Schema</h2>
          <ul>
            {SCHEMA.map((t) => (
              <li key={t.table} className="py-3 border-b-2 border-ink/15">
                <button
                  onClick={() => runExample(`SELECT * FROM ${t.table};`)}
                  disabled={!ready}
                  className="font-mono text-[0.875rem] font-medium text-ink underline decoration-orange decoration-2 hover:decoration-ink disabled:opacity-40"
                  title={`SELECT * FROM ${t.table};`}
                >
                  {t.table}
                </button>
                <p className="font-mono text-[0.75rem] text-ink-soft leading-relaxed mt-1">
                  {t.columns.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Leaf>
  );
}
