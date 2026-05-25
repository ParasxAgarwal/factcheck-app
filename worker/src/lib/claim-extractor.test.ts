import { describe, expect, it } from "vitest";
import { extractClaimsFromText } from "./claim-extractor";

describe("extractClaimsFromText", () => {
  it("extracts only sentences with numbers/years", () => {
    const text = `
      This report is about the industry.
      Revenue grew 12% year over year in 2024.
      Another qualitative sentence.
      The capex was $3.2 million.
    `;

    const claims = extractClaimsFromText(text);
    expect(claims.length).toBe(2);
    expect(claims[0].text).toContain("12%");
    expect(claims[0].years).toContain("2024");
    expect(claims[1].numbers.join(" ")).toContain("3.2");
  });
});

