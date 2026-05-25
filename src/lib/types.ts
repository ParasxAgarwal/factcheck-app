export type Verdict = "verified" | "inaccurate" | "false";

export type Claim = {
  id: string;
  text: string;
  numbers: string[];
  years: string[];
};

export type ClaimResult = {
  claim: Claim;
  verdict: Verdict;
  confidence: number;
  evidence: Array<{
    title: string;
    url: string;
    snippet?: string;
    matchedNumbers: string[];
  }>;
};

/** All paths return { id, results, warning? } — simpler discriminant */
export type AnalyzeResponse = {
  id: string;
  results: ClaimResult[];
  warning?: string;
};
