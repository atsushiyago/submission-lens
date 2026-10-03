export const MAX_RULE_CHARACTERS = 50_000;

export const REQUIREMENT_CATEGORIES = [
  "Deadline",
  "Deliverable",
  "Repository",
  "Video",
  "Eligibility",
  "Other",
] as const;

export type RequirementCategory = (typeof REQUIREMENT_CATEGORIES)[number];
export type Certainty = "clear" | "uncertain";

export interface ModelRequirement {
  title: string;
  category: RequirementCategory;
  sourceExcerpt: string;
  certainty: Certainty;
}

export interface OrganizerRequirement extends Omit<ModelRequirement, "sourceExcerpt"> {
  id: string;
  sourceExcerpt: string | null;
  needsReview: boolean;
}

export interface AnalysisResponse {
  requirements: OrganizerRequirement[];
}

export const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    requirements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: { type: "string", enum: [...REQUIREMENT_CATEGORIES] },
          sourceExcerpt: { type: "string" },
          certainty: { type: "string", enum: ["clear", "uncertain"] },
        },
        required: ["title", "category", "sourceExcerpt", "certainty"],
        additionalProperties: false,
      },
    },
  },
  required: ["requirements"],
  additionalProperties: false,
} as const;

export class InvalidAnalysisError extends Error {
  constructor(message = "The analysis response did not match the required format.") {
    super(message);
    this.name = "InvalidAnalysisError";
  }
}

export function countCharacters(value: string): number {
  return Array.from(value).length;
}

export function parseAnalysisText(text: string): ModelRequirement[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new InvalidAnalysisError("The analysis response was not valid JSON.");
  }

  if (!isRecord(parsed) || !hasOnlyKeys(parsed, ["requirements"]) || !Array.isArray(parsed.requirements)) {
    throw new InvalidAnalysisError();
  }

  return parsed.requirements.map((item): ModelRequirement => {
    if (!isRecord(item) || !hasOnlyKeys(item, ["title", "category", "sourceExcerpt", "certainty"])) {
      throw new InvalidAnalysisError();
    }

    if (
      typeof item.title !== "string" ||
      item.title.trim().length === 0 ||
      typeof item.sourceExcerpt !== "string" ||
      !REQUIREMENT_CATEGORIES.includes(item.category as RequirementCategory) ||
      (item.certainty !== "clear" && item.certainty !== "uncertain")
    ) {
      throw new InvalidAnalysisError();
    }

    return {
      title: item.title.trim(),
      category: item.category as RequirementCategory,
      sourceExcerpt: item.sourceExcerpt,
      certainty: item.certainty,
    };
  });
}

export function verifySourceExcerpts(
  requirements: ModelRequirement[],
  sourceText: string,
): OrganizerRequirement[] {
  const normalizedSource = normalizeWhitespace(sourceText);

  return requirements.map((requirement, index) => {
    const excerpt = normalizeWhitespace(requirement.sourceExcerpt);
    const excerptMatches = excerpt.length > 0 && normalizedSource.includes(excerpt);

    return {
      id: String(index),
      title: requirement.title,
      category: requirement.category,
      sourceExcerpt: excerptMatches ? requirement.sourceExcerpt.trim() : null,
      certainty: requirement.certainty,
      needsReview: requirement.certainty === "uncertain" || !excerptMatches,
    };
  });
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).length === allowed.length && Object.keys(value).every((key) => allowed.includes(key));
}
