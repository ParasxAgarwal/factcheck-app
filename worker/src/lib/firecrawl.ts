import type { SearchResult } from "./verifier";

type FirecrawlResponse = {
  success?: boolean;
  data?: {
    web?: Array<{
      title?: string;
      description?: string;
      url?: string;
      markdown?: string;
    }>;
  };
  warning?: string | null;
};

export async function firecrawlSearch(opts: {
  q: string;
  apiKey: string;
  fetchImpl: typeof fetch;
  limit?: number;
  country?: string;
}): Promise<SearchResult[]> {
  const limit = opts.limit ?? 5;
  const country = opts.country ?? "IN";

  const res = await opts.fetchImpl("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: opts.q,
      limit,
      sources: ["web"],
      country,
      timeout: 25_000,
      // keep credits low (don’t scrape full markdown by default)
      scrapeOptions: { formats: [] },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Firecrawl search failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as FirecrawlResponse;
  const web = data.data?.web ?? [];
  return web
    .map((r) => ({
      title: String(r.title ?? ""),
      url: String(r.url ?? ""),
      content: r.description ? String(r.description) : undefined,
    }))
    .filter((r) => r.title && r.url)
    .slice(0, limit);
}

