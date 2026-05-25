import type { SearchResult } from "./verifier";

type BraveWebResult = {
  title?: string;
  url?: string;
  description?: string;
};

type BraveResponse = {
  web?: {
    results?: BraveWebResult[];
  };
};

export async function braveSearch(opts: {
  q: string;
  apiKey: string;
  fetchImpl: typeof fetch;
  count?: number;
  country?: string;
  searchLang?: string;
}): Promise<SearchResult[]> {
  const count = opts.count ?? 5;
  const country = opts.country ?? "IN";
  const searchLang = opts.searchLang ?? "en";

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", opts.q);
  url.searchParams.set("count", String(count));
  url.searchParams.set("country", country);
  url.searchParams.set("search_lang", searchLang);

  const res = await opts.fetchImpl(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": opts.apiKey,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brave Search request failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as BraveResponse;
  const results = data.web?.results ?? [];
  return results
    .map((r) => ({
      title: String(r.title ?? ""),
      url: String(r.url ?? ""),
      content: r.description ? String(r.description) : undefined,
    }))
    .filter((r) => r.title && r.url)
    .slice(0, count);
}

