import { Hono } from "hono";
import { cors } from "hono/cors";
import { extractClaimsFromText } from "./lib/claim-extractor";
import { verifyClaims, verifyClaimsWithSearch } from "./lib/verifier";
import { braveSearch } from "./lib/brave";
import { firecrawlSearch } from "./lib/firecrawl";

type Bindings = {
  // Provided by the template (Workers with Assets)
  ASSETS: Fetcher;

  // Optional bindings (configured in wrangler.* and in Cloudflare dashboard)
  FACTCHECK_PDFS?: R2Bucket;
  FACTCHECK_DB?: D1Database;

  // ENV VARS
  SEARXNG_URL?: string;
  FIRECRAWL_API_KEY?: string;
  BRAVE_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  })
);

app.get("/api/health", (c) => c.json({ ok: true, v: 2 }));

app.post("/api/analyze", async (c) => {
  // Multipart: { pdf: File, extractedText: string }
  const body = await c.req.parseBody();
  const pdf = body["pdf"];
  const extractedTextRaw = body["extractedText"];

  if (!(pdf instanceof File)) {
    return c.json({ error: "Missing PDF file (field name: pdf)" }, 400);
  }

  const extractedText = typeof extractedTextRaw === "string" ? extractedTextRaw.trim() : "";
  if (!extractedText) {
    return c.json(
      { error: "Missing extractedText (frontend should extract PDF text and send it)" },
      400
    );
  }

  const id = crypto.randomUUID();

  // Best-effort storage (optional for local dev)
  if (c.env.FACTCHECK_PDFS) {
    await c.env.FACTCHECK_PDFS.put(`${id}.pdf`, await pdf.arrayBuffer(), {
      httpMetadata: { contentType: pdf.type || "application/pdf" },
      customMetadata: { filename: pdf.name },
    });
  }

  const claims = extractClaimsFromText(extractedText);

  // Handle image-only / scanned PDFs that yield no extractable claims
  if (claims.length === 0) {
    return c.json(
      { id, results: [], warning: "No checkable claims found. The PDF may be image-only (scanned), or contain no numeric/date statements." },
      200
    );
  }

  const searxngUrl = c.env.SEARXNG_URL;
  const firecrawlApiKey = c.env.FIRECRAWL_API_KEY;
  const braveApiKey = c.env.BRAVE_API_KEY;

  if (!searxngUrl && !firecrawlApiKey && !braveApiKey) {
    return c.json(
      { id, results: [], warning: "No search provider configured — verification skipped. Set FIRECRAWL_API_KEY, SEARXNG_URL, or BRAVE_API_KEY on the Worker." },
      200
    );
  }

  try {
    // Bind fetch to globalThis to avoid "Illegal invocation" in Workers runtime
    const boundFetch = fetch.bind(globalThis);

    // Priority: SearXNG (self-hosted) → Firecrawl (key, usually no card) → Brave (may need billing profile)
    const results = searxngUrl
      ? await verifyClaims({ claims, searxngUrl, fetchImpl: boundFetch })
      : firecrawlApiKey
        ? await verifyClaimsWithSearch({
            claims,
            search: (q) =>
              firecrawlSearch({
                q,
                apiKey: firecrawlApiKey as string,
                fetchImpl: boundFetch,
                limit: 5,
                country: "IN",
              }),
          })
        : await verifyClaimsWithSearch({
            claims,
            search: (q) =>
              braveSearch({
                q,
                apiKey: braveApiKey as string,
                fetchImpl: boundFetch,
                count: 5,
                country: "IN",
                searchLang: "en",
              }),
          });

    return c.json({ id, results }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("analyze error:", message);
    return c.json({ error: `Verification failed: ${message}` }, 500);
  }
});

export default app;
