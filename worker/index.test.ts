import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { handleAnalyze } from "./index";

const SAMPLE_TEXT = "Submit a demo video under three minutes.";
const VALID_REQUIREMENTS = JSON.stringify({
  requirements: [
    {
      title: "Upload a demo video under three minutes",
      category: "Video",
      sourceExcerpt: SAMPLE_TEXT,
      certainty: "clear",
    },
  ],
});

const env = {
  GEMINI_API_KEY: "test-key",
  GEMINI_MODEL: "gemini-test-model",
  ASSETS: { fetch: vi.fn() },
};

function mockInteractionResponse(text: string): Response {
  return Response.json({
    status: "completed",
    steps: [{ type: "model_output", content: [{ type: "text", text }] }],
  });
}

function apiRequest(text = SAMPLE_TEXT): Request {
  return new Request("https://submission-lens.test/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("POST /api/analyze", () => {
  it("rejects oversized input on the server without calling Gemini", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const response = await handleAnalyze(apiRequest("a".repeat(50_001)), env);

    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ error: { code: "input_too_long" } });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("turns malformed structured output into a controlled error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockInteractionResponse('{"requirements":[')));

    const response = await handleAnalyze(apiRequest(), env);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({ error: { code: "analysis_failed", message: "Analysis returned an invalid result. Please try again." } });
    expect(JSON.stringify(body)).not.toContain("requirements");
  });

  it("turns schema-invalid structured output into a controlled error", async () => {
    const invalid = JSON.stringify({
      requirements: [
        {
          title: "Upload a video",
          category: "Video",
          sourceExcerpt: SAMPLE_TEXT,
          certainty: "clear",
          extra: "unsupported",
        },
      ],
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockInteractionResponse(invalid)));

    const response = await handleAnalyze(apiRequest(), env);
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: { code: "analysis_failed" } });
  });

  it("marks an unmatched source excerpt for review and never returns that quote", async () => {
    const invalidExcerpt = VALID_REQUIREMENTS.replace(SAMPLE_TEXT, "Your video must be public.");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockInteractionResponse(invalidExcerpt)));

    const response = await handleAnalyze(apiRequest(), env);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      requirements: [{ needsReview: true, sourceExcerpt: null }],
    });
    expect(JSON.stringify(body)).not.toContain("Your video must be public.");
  });

  it("uses the configured model, server key, schema, and stateless Interactions request", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(mockInteractionResponse(VALID_REQUIREMENTS));
    vi.stubGlobal("fetch", fetchSpy);

    const response = await handleAnalyze(apiRequest(), env);
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const requestBody = JSON.parse(String(options.body));

    expect(response.status).toBe(200);
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    expect(new Headers(options.headers).get("x-goog-api-key")).toBe("test-key");
    expect(requestBody).toMatchObject({
      model: "gemini-test-model",
      store: false,
      response_format: { type: "text", mime_type: "application/json", schema: expect.any(Object) },
    });
  });

  it("defaults to Gemini 3.6 Flash when no model override is configured", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(mockInteractionResponse(VALID_REQUIREMENTS));
    vi.stubGlobal("fetch", fetchSpy);

    const response = await handleAnalyze(apiRequest(), { ...env, GEMINI_MODEL: undefined });
    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const requestBody = JSON.parse(String(options.body));

    expect(response.status).toBe(200);
    expect(requestBody.model).toBe("gemini-3.6-flash");
  });

  it("routes unknown API paths to a JSON not-found response", async () => {
    const response = await worker.fetch(
      new Request("https://submission-lens.test/api/other"),
      env,
    );
    expect(response.status).toBe(404);
  });
});
