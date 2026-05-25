export type SearxngResult = {
  title: string;
  url: string;
  content?: string;
  engine?: string;
};

export type SearxngResponse = {
  query: string;
  results: SearxngResult[];
};

export async function searxngSearch(opts: {
  searxngUrl: string;
  q: string;
  fetchImpl: typeof fetch;
  maxResults?: number;
}): Promise<SearxngResult[]> {
  const maxResults = opts.maxResults ?? 5;

  const url = new URL("/search", opts.searxngUrl);
  url.searchParams.set("q", opts.q);
  url.searchParams.set("format", "json");
  url.searchParams.set("safesearch", "1");
  url.searchParams.set("language", "en");

  const res = await opts.fetchImpl(url.toString(), {
    method: "GET",
    headers: {
      "accept": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SearXNG request failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as Partial<SearxngResponse>;
  const results = Array.isArray(data.results) ? data.results : [];
  return results
    .map((r) => ({
      title: String(r.title ?? ""),
      url: String(r.url ?? ""),
      content: r.content ? String(r.content) : undefined,
      engine: r.engine ? String(r.engine) : undefined,
    }))
    .filter((r) => r.title && r.url)
    .slice(0, maxResults);
}

