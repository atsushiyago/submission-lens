import { REQUIREMENT_CATEGORIES, type AnalysisResponse } from "../shared/analysis";

export class AnalyzeRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyzeRequestError";
  }
}

export async function analyzeRules(text: string): Promise<AnalysisResponse> {
  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    throw new AnalyzeRequestError("Analysis could not reach the server. Please try again.");
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code = getErrorCode(result);
    if (code === "input_too_long") {
      throw new AnalyzeRequestError("Rules must be 50,000 characters or fewer.");
    }
    if (code === "invalid_input") {
      throw new AnalyzeRequestError("Paste some hackathon rules or submission requirements before analyzing.");
    }
    throw new AnalyzeRequestError("Analysis failed. Please try again.");
  }

  if (!isAnalysisResponse(result)) {
    throw new AnalyzeRequestError("Analysis returned an unexpected result. Please try again.");
  }

  return result;
}

function getErrorCode(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("error" in value)) return null;
  const error = value.error;
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

function isAnalysisResponse(value: unknown): value is AnalysisResponse {
  if (typeof value !== "object" || value === null || !("requirements" in value)) return false;
  if (!Array.isArray(value.requirements)) return false;

  return value.requirements.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    return (
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      REQUIREMENT_CATEGORIES.includes(item.category as (typeof REQUIREMENT_CATEGORIES)[number]) &&
      (item.sourceExcerpt === null || typeof item.sourceExcerpt === "string") &&
      typeof item.needsReview === "boolean" &&
      (item.certainty === "clear" || item.certainty === "uncertain")
    );
  });
}
