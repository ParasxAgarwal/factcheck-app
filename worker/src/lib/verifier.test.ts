import { describe, expect, it } from "vitest";
import type { ExtractedClaim } from "./claim-extractor";
import { scoreClaimAgainstResults } from "./verifier";

describe("scoreClaimAgainstResults", () => {
  it("marks verified when numbers match", () => {
    const claim: ExtractedClaim = {
      id: "c1",
      text: "ACME's revenue grew 12% in 2024.",
      numbers: ["12%"],
      years: ["2024"],
    };

    const verdict = scoreClaimAgainstResults(claim, [
      {
        title: "ACME annual report 2024",
        url: "https://example.com/report",
        content: "ACME reported revenue growth of 12% in 2024 driven by subscriptions.",
      },
    ]);

    expect(verdict.verdict).toBe("verified");
    expect(verdict.evidence[0].matchedNumbers).toContain("12%");
  });

  it("marks inaccurate when keywords match but numbers conflict", () => {
    const claim: ExtractedClaim = {
      id: "c2",
      text: "ACME's revenue grew 12% in 2024.",
      numbers: ["12%"],
      years: ["2024"],
    };

    const verdict = scoreClaimAgainstResults(claim, [
      {
        title: "ACME annual report 2024",
        url: "https://example.com/report",
        content: "ACME reported revenue growth of 8% in 2024.",
      },
    ]);

    expect(verdict.verdict).toBe("inaccurate");
  });

  it("marks false when no relevant evidence exists", () => {
    const claim: ExtractedClaim = {
      id: "c3",
      text: "ACME's revenue grew 12% in 2024.",
      numbers: ["12%"],
      years: ["2024"],
    };

    const verdict = scoreClaimAgainstResults(claim, [
      {
        title: "Unrelated news",
        url: "https://example.com/other",
        content: "Totally different topic with no mention of ACME.",
      },
    ]);

    expect(verdict.verdict).toBe("false");
  });
});

