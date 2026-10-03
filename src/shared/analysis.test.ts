import { describe, expect, it } from "vitest";
import {
  InvalidAnalysisError,
  countCharacters,
  parseAnalysisText,
  verifySourceExcerpts,
} from "./analysis";

describe("analysis contract", () => {
  it("counts Unicode code points toward the pasted-text limit", () => {
    expect(countCharacters("a😀b")).toBe(3);
  });

  it("rejects malformed JSON rather than repairing it", () => {
    expect(() => parseAnalysisText('{"requirements":[')).toThrow(InvalidAnalysisError);
  });

  it("rejects a schema mismatch, including unexpected properties", () => {
    const fixture = JSON.stringify({
      requirements: [
        {
          title: "Publish the repository",
          category: "Repository",
          sourceExcerpt: "Make your repository public.",
          certainty: "clear",
          confidence: 1,
        },
      ],
    });

    expect(() => parseAnalysisText(fixture)).toThrow(InvalidAnalysisError);
  });

  it("suppresses an excerpt that is absent from the source and marks the item for review", () => {
    const parsed = parseAnalysisText(
      JSON.stringify({
        requirements: [
          {
            title: "Make the repository public",
            category: "Repository",
            sourceExcerpt: "Your project must be public.",
            certainty: "clear",
          },
        ],
      }),
    );

    expect(verifySourceExcerpts(parsed, "Provide a link to your project repository.")).toEqual([
      {
        id: "0",
        title: "Make the repository public",
        category: "Repository",
        sourceExcerpt: null,
        certainty: "clear",
        needsReview: true,
      },
    ]);
  });

  it("matches excerpts after trimming and collapsing whitespace", () => {
    const parsed = parseAnalysisText(
      JSON.stringify({
        requirements: [
          {
            title: "Upload the demo video",
            category: "Video",
            sourceExcerpt: "  Submit a demo\nvideo under three minutes. ",
            certainty: "clear",
          },
        ],
      }),
    );

    expect(verifySourceExcerpts(parsed, "Submit a demo   video under three minutes.")[0]).toMatchObject({
      sourceExcerpt: "Submit a demo\nvideo under three minutes.",
      needsReview: false,
    });
  });
});
