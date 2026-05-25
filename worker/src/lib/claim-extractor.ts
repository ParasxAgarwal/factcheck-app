export type ExtractedClaim = {
  id: string;
  text: string;
  numbers: string[];
  years: string[];
};

/**
 * Matches meaningful numeric tokens with word boundaries:
 * - Currency amounts:  $150 billion, ₹10,000 crore, €2.5M
 * - Percentages:       35%, 8.4%, 0.5%
 * - Large numbers:     1.15 billion, 14 million, 600 billion
 * - Plain numbers:     1.8, 5.9
 *
 * Uses \b to prevent matching "202" out of "2023" or "3" out of "35%".
 * The currency prefix is handled separately so \b still applies to the digit.
 */
const numberRegex =
  /(?:(?:₹|\$|€|£)\s*\d[\d,]*(?:\.\d+)?\s*(?:billion|million|trillion|crore|lakh|bn|mn|k|M|B|K|%|bps|bp)?|\b\d[\d,]*(?:\.\d+)?\s*(?:billion|million|trillion|crore|lakh|bn|mn|k|M|B|K|%|bps|bp)\b|\b\d[\d,]*(?:\.\d+)?(?=\s+(?:billion|million|trillion|crore|lakh))\b)/g;

/** Matches 4-digit years 1900–2099, whole word only */
const yearRegex = /\b(19|20)\d{2}\b/g;

function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Filters out boilerplate / noise sentences:
 * page numbers, copyright, figure labels, all-caps headers, bare URLs, etc.
 */
function isNoise(s: string): boolean {
  const t = s.trim();
  if (t.length < 25) return true;
  if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(t)) return true;
  if (/^©|copyright\s+\d{4}/i.test(t)) return true;
  if (/^(figure|fig\.?|table|chart|exhibit|appendix|section|clause)\s+[\d.]+/i.test(t)) return true;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^\d[\d\s.,;:–-]*$/.test(t)) return true;
  if (/^[A-Z][A-Z\s]{6,}$/.test(t)) return true; // ALL CAPS header
  const words = t.replace(/[^a-zA-Z\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
  if (words.length < 5) return true;
  return false;
}

function splitIntoSentences(text: string): string[] {
  const cleaned = normalizeWhitespace(text);
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z"(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractNumbers(s: string): string[] {
  const matches = s.match(numberRegex) ?? [];
  return [...new Set(
    matches
      .map((m) => normalizeWhitespace(m))
      .filter((m) => /\d/.test(m))
  )].slice(0, 8);
}

function extractYears(s: string): string[] {
  return [...new Set(s.match(yearRegex) ?? [])].slice(0, 4);
}

/**
 * Extracts "checkable" claims: sentences with at least one meaningful
 * numeric/date token that pass the noise filter.
 */
export function extractClaimsFromText(text: string): ExtractedClaim[] {
  const sentences = splitIntoSentences(text);
  const raw = sentences
    .map((s) => ({
      s: s.length > 260 ? s.slice(0, 257) + "…" : s,
      numbers: extractNumbers(s),
      years: extractYears(s),
    }))
    .filter((x) => (x.numbers.length > 0 || x.years.length > 0) && !isNoise(x.s));

  const seen = new Set<string>();
  const out: ExtractedClaim[] = [];
  for (const item of raw) {
    const key = item.s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: crypto.randomUUID(),
      text: item.s,
      numbers: item.numbers,
      years: item.years,
    });
  }

  return out.slice(0, 30);
}
