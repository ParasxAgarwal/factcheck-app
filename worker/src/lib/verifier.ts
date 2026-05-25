import type { ExtractedClaim } from "./claim-extractor";
import { searxngSearch } from "./searxng";

export type Verdict = "verified" | "inaccurate" | "false";

export type ClaimVerdict = {
  claim: ExtractedClaim;
  verdict: Verdict;
  confidence: number; // 0..1
  evidence: Array<{
    title: string;
    url: string;
    snippet?: string;
    matchedNumbers: string[];
  }>;
};

export type SearchResult = {
  title: string;
  url: string;
  content?: string;
};

const numberRegex =
  /(?:₹|\$|€|£)?\s*-?\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*(?:%|bps|bp|k|K|m|M|bn|B|billion|million|crore|lakh)?/g;

function normalizeForMatch(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function extractNumbersFromEvidence(s: string): string[] {
  const matches = s.match(numberRegex) ?? [];
  return matches
    .map((m) => m.replace(/\s+/g, " ").trim())
    .filter((m) => /\d/.test(m))
    .slice(0, 25);
}

function overlap(a: string[], b: string[]) {
  const bs = new Set(b.map((x) => normalizeForMatch(x)));
  return a.filter((x) => bs.has(normalizeForMatch(x)));
}

function pickKeywords(text: string): string[] {
  // Simple keyword extraction: keep longer tokens
  return normalizeForMatch(text)
    .replace(/[^a-z0-9%₹$€£ ]/g, " ")
    .split(" ")
    .filter((t) => t.length >= 5 && !/^\d+$/.test(t))
    .slice(0, 8);
}

function keywordScore(haystack: string, keywords: string[]) {
  const h = normalizeForMatch(haystack);
  if (keywords.length === 0) return 0;
  let hits = 0;
  for (const k of keywords) if (h.includes(k)) hits += 1;
  return hits / keywords.length;
}

export function scoreClaimAgainstResults(claim: ExtractedClaim, results: SearchResult[]): ClaimVerdict {
  const keywords = pickKeywords(claim.text);

  const evidence = results.map((r) => {
    const combined = `${r.title}\n${r.content ?? ""}`;
    const evidenceNumbers = extractNumbersFromEvidence(combined);
    const matchedNumbers = overlap(claim.numbers, evidenceNumbers);
    return {
      title: r.title,
      url: r.url,
      snippet: r.content,
      matchedNumbers,
      _combined: combined,
      _evidenceNumbers: evidenceNumbers,
      _kwScore: keywordScore(combined, keywords),
    };
  });

  // Verified: strong keyword match + at least one numeric match.
  // If the claim has no explicit numbers (rare), allow year-only match.
  const verifiedEv = evidence.find((e) => {
    const hasYearMatch = claim.years.some((y) => e._combined.includes(y));
    const ok =
      e.matchedNumbers.length > 0 ||
      (claim.numbers.length === 0 && hasYearMatch);
    return ok && e._kwScore >= 0.35;
  });
  if (verifiedEv) {
    return {
      claim,
      verdict: "verified",
      confidence: Math.min(0.95, 0.6 + verifiedEv._kwScore * 0.5),
      evidence: [
        {
          title: verifiedEv.title,
          url: verifiedEv.url,
          snippet: verifiedEv.snippet,
          matchedNumbers: verifiedEv.matchedNumbers,
        },
      ],
    };
  }

  // Inaccurate: keyword match is decent, but numbers conflict (evidence has numbers, none match claim's numbers)
  const inaccurateEv = evidence.find((e) => e._kwScore >= 0.35 && e._evidenceNumbers.length > 0 && e.matchedNumbers.length === 0);
  if (inaccurateEv) {
    return {
      claim,
      verdict: "inaccurate",
      confidence: Math.min(0.85, 0.45 + inaccurateEv._kwScore * 0.55),
      evidence: [
        {
          title: inaccurateEv.title,
          url: inaccurateEv.url,
          snippet: inaccurateEv.snippet,
          matchedNumbers: [],
        },
      ],
    };
  }

  // False/no evidence
  return {
    claim,
    verdict: "false",
    confidence: 0.55,
    evidence: results.slice(0, 2).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      matchedNumbers: [],
    })),
  };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (idx < items.length) {
      const current = idx++;
      results[current] = await fn(items[current]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function verifyClaims(opts: {
  claims: ExtractedClaim[];
  searxngUrl: string;
  fetchImpl: typeof fetch;
}): Promise<ClaimVerdict[]> {
  return verifyClaimsWithSearch({
    claims: opts.claims,
    search: async (q) =>
      searxngSearch({
        searxngUrl: opts.searxngUrl,
        q,
        fetchImpl: opts.fetchImpl,
        maxResults: 5,
      }),
  });
}

export async function verifyClaimsWithSearch(opts: {
  claims: ExtractedClaim[];
  search: (q: string) => Promise<SearchResult[]>;
}): Promise<ClaimVerdict[]> {
  return mapLimit(opts.claims, 3, async (claim) => {
    try {
      const results = await opts.search(claim.text);
      return scoreClaimAgainstResults(claim, results);
    } catch (err) {
      // If search fails for a claim, return unverified rather than crashing
      const msg = err instanceof Error ? err.message : String(err);
      console.error("search error for claim:", claim.text.slice(0, 60), "->", msg);
      return {
        claim,
        verdict: "false" as Verdict,
        confidence: 0,
        evidence: [],
      };
    }
  });
}
