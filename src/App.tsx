import { useMemo, useState } from "react";
import "./App.css";
import { extractTextFromPdf } from "./lib/pdf";
import type { AnalyzeResponse, ClaimResult, Verdict } from "./lib/types";

/* ── tiny inline SVGs ─────────────────────────────────────────── */
const UploadSVG = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10V3M5 6l3-3 3 3"/><path d="M2 11v1.5A1.5 1.5 0 003.5 14h9A1.5 1.5 0 0014 12.5V11"/>
  </svg>
);

const FileSVG = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6l-3-4z"/><path d="M10 2v4h4"/>
  </svg>
);

const LogoSVG = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6h8M2 3h5M2 9h6"/>
  </svg>
);

const WarnSVG = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1L1 14h14L8 1z"/><path d="M8 6v4M8 11.5h.01"/>
  </svg>
);

const ErrSVG = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6"/><path d="M8 5v4M8 10.5h.01"/>
  </svg>
);

const GitHubSVG = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

/* ── helpers ──────────────────────────────────────────────────── */
function label(v: Verdict) {
  if (v === "verified")   return "Verified";
  if (v === "inaccurate") return "Inaccurate";
  return "No evidence";
}

function statusText(s: string) {
  if (s === "extracting") return "Extracting text";
  if (s === "verifying")  return "Verifying claims";
  if (s === "done")       return "Complete";
  if (s === "error")      return "Failed";
  return "";
}

/* ── App ──────────────────────────────────────────────────────── */
export default function App() {
  const [file,     setFile]     = useState<File | null>(null);
  const [status,   setStatus]   = useState<"idle"|"extracting"|"verifying"|"done"|"error">("idle");
  const [pct,      setPct]      = useState(0);
  const [error,    setError]    = useState<string | null>(null);
  const [results,  setResults]  = useState<ClaimResult[] | null>(null);
  const [warning,  setWarning]  = useState<string | null>(null);
  const [drag,     setDrag]     = useState(false);

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL || "http://localhost:8787", []);

  async function run(f: File) {
    setFile(f); setError(null); setWarning(null); setResults(null); setPct(0);
    try {
      setStatus("extracting");
      const text = await extractTextFromPdf(f, p => setPct(Math.round(p * 70)));
      setStatus("verifying"); setPct(75);
      const form = new FormData();
      form.append("pdf", f);
      form.append("extractedText", text);
      const res = await fetch(`${apiBase}/api/analyze`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`API error: ${res.status} ${(await res.text().catch(() => "")).slice(0, 160)}`);
      const data = (await res.json()) as AnalyzeResponse;
      if (data.warning) setWarning(data.warning);
      setResults(data.results ?? []);
      setPct(100); setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  const stats = useMemo(() => {
    if (!results) return null;
    return {
      v: results.filter(r => r.verdict === "verified").length,
      i: results.filter(r => r.verdict === "inaccurate").length,
      f: results.filter(r => r.verdict === "false").length,
      n: results.length,
    };
  }, [results]);

  const running = status === "extracting" || status === "verifying";

  return (
    <div className="page">

      {/* nav */}
      <nav className="nav">
        <div className="navLeft">
          <div className="navMark"><LogoSVG /></div>
          <span className="navTitle">FactCheck</span>
          <div className="navDivider" />
          <span className="navSub">PDF Claim Verifier</span>
        </div>
        <a href="https://github.com/ParasxAgarwal/factcheck-app" target="_blank" rel="noreferrer" className="navGitHub" title="View on GitHub">
          <GitHubSVG />
        </a>
      </nav>

      {/* content */}
      <div className="content">

        {/* heading */}
        <div>
          <h1 className="pageTitle">PDF Fact-Checker</h1>
          <p className="pageDesc">
            Upload a document to extract numeric and date-based claims,
            then verify each one against live web sources.
          </p>
        </div>

        {/* upload panel */}
        <div className="panel">
          <label
            className={`dropzone${drag ? " drag" : ""}`}
            onDragEnter={() => setDrag(true)}
            onDragLeave={() => setDrag(false)}
            onDrop={() => setDrag(false)}
          >
            <input type="file" accept="application/pdf"
              onChange={e => { const f = e.target.files?.[0]; if (f) void run(f); }} />
            <div className="uploadIcon"><UploadSVG /></div>
            {file ? (
              <div className="selectedFile"><FileSVG />{file.name}</div>
            ) : (
              <>
                <span className="uploadPrimary">Click to upload or drag a PDF here</span>
                <span className="uploadSecondary">PDF only · processed in your browser</span>
              </>
            )}
          </label>

          {status !== "idle" && (
            <div className="progressStrip">
              <div className="progressRow">
                <span className="progressStatus">
                  {running && <span className="pulseDot" />}
                  {statusText(status)}
                </span>
                <span className="progressNum">{pct}%</span>
              </div>
              <div className="track">
                <div className={`fill${status === "done" ? " done" : status === "error" ? " error" : ""}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {warning && (
            <div className="alert warn"><WarnSVG /><span>{warning}</span></div>
          )}
          {error && (
            <div className="alert err"><ErrSVG /><span>{error}</span></div>
          )}
        </div>

        {/* results */}
        {results !== null && stats && (
          <div>
            <div className="resultsHead">
              <span className="resultsLabel">Results</span>
              <span className="resultsCount">{stats.n} claim{stats.n !== 1 ? "s" : ""}</span>
            </div>

            <div className="pills">
              {stats.v > 0 && <span className="pill v"><span className="pillDot"/>{stats.v} verified</span>}
              {stats.i > 0 && <span className="pill i"><span className="pillDot"/>{stats.i} inaccurate</span>}
              {stats.f > 0 && <span className="pill f"><span className="pillDot"/>{stats.f} no evidence</span>}
            </div>

            <div className="table">
              <div className="thead">
                <div className="th">Claim</div>
                <div className="th">Verdict</div>
                <div className="th">Source</div>
                <div className="th">Verified</div>
              </div>
              {results.map(r => <Row key={r.claim.id} r={r} />)}
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <footer className="footer">
        <span>@PARASAGARWAL</span>
      </footer>
    </div>
  );
}

/* ── Row ──────────────────────────────────────────────────────── */
function Row({ r }: { r: ClaimResult }) {
  const conf = Math.round((r.confidence ?? 0) * 100);
  const ev   = r.evidence?.[0];
  const verifiedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const verifiedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="trow">
      <div className="td">{r.claim.text}</div>

      <div className="td">
        <span className={`badge ${r.verdict}`}>
          <span className="badgeDot" />
          {label(r.verdict)}
        </span>
        {conf > 0 && (
          <div className="confTrack">
            <div className={`confFill ${r.verdict}`} style={{ width: `${conf}%` }} />
          </div>
        )}
      </div>

      <div className="td">
        {ev?.url ? (
          <>
            <a className="evLink" href={ev.url} target="_blank" rel="noreferrer">{ev.title}</a>
            {ev.snippet && <div className="evSnippet">{ev.snippet}</div>}
          </>
        ) : (
          <span className="evNone">—</span>
        )}
      </div>

      <div className="td">
        <span className="verifiedDate" title={`Verified at ${verifiedTime}`}>{verifiedDate}</span>
      </div>
    </div>
  );
}
