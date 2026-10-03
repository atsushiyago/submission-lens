---
doc: spec
status: approved
---

# Submission Lens — Technical Spec

## How This Works, In Plain Language

The browser shows one page and keeps the pasted text, analysis results, and checkbox progress in memory while the page is open. Refreshing starts a clean session; nothing is saved in a database.

When the user clicks **Analyze**, the browser sends text of at most 50,000 characters to one Cloudflare Worker route at `/api/analyze`. The client blocks longer text before making a request, and the Worker independently enforces the same limit. The Worker holds the Gemini API key, asks Gemini for a response in a fixed JSON shape through the Interactions API, and checks the response before returning it. The browser never receives the API key.

The function also checks each quoted excerpt against the pasted rules after trimming and collapsing whitespace. If the excerpt is not present, the requirement can remain visible as **Needs review**, but the quote is removed and the interface says “No matching source excerpt found.” This verifies the quote is present; it cannot prove that the model interpreted the quote correctly, so unclear wording must still be marked for review.

The safety checklist is a fixed list in the app. Gemini does not create or modify those items. Cloudflare serves the page and runs the function; there is no database. The free Gemini tier may use submitted content to improve Google products, so the page warns people not to paste confidential, sensitive, or personal information.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. The browser renders the Submission Lens page, including its privacy notice, rules text area, and **Analyze** button.
2. The user pastes rules. React keeps the input in page memory; it is not saved or sent until **Analyze** is clicked.
3. The browser blocks inputs over 50,000 characters with an inline message and no request; otherwise it posts `{ "text": "..." }` to same-origin `/api/analyze`.
4. The Worker validates that the request contains non-empty text within the 50,000-character limit, reads `GEMINI_API_KEY` and `GEMINI_MODEL` from its server environment, and sends a schema-constrained request to Gemini.
5. The Worker parses and validates Gemini's response. It checks each `sourceExcerpt` against the pasted text using whitespace-normalized substring matching, sets review status where needed, and returns the checked result.
6. React displays the organizer checklist and the fixed safety checklist in separate sections. It owns checkbox state and updates section counts and the remaining-work summary immediately.
7. If the function or model fails, React keeps the pasted text and shows a short retryable error. If the page is refreshed, in-memory input, results, and progress reset.

## Stack

- **Vite + React + TypeScript** — learner-selected single-page web app stack. Vite serves the development page and builds static assets; React renders the single workflow; TypeScript describes request, response, and checklist shapes. [Vite](https://vite.dev/guide/), [React](https://react.dev/learn), [TypeScript](https://www.typescriptlang.org/docs/).
- **Cloudflare Workers with Static Assets and the Cloudflare Vite plugin** — one deployment serves the React SPA and `/api/analyze`, with no separate server or Pages Functions. [Vite plugin tutorial](https://developers.cloudflare.com/workers/vite-plugin/tutorial/), [Static Assets](https://developers.cloudflare.com/workers/static-assets/).
- **Gemini 3.8 Flash through the REST Interactions API** — learner-selected model and provider. The model is read from server-side `GEMINI_MODEL` with `gemini-3.8-flash` as the initial deployment value; it is not compiled into the browser. Gemini's structured JSON response makes results predictable to parse, but does not establish that a requirement is true. [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models), [Interactions API](https://ai.google.dev/api/interactions-api), [structured outputs](https://ai.google.dev/gemini-api/docs/structured-output).
- **Plain `fetch` for the Gemini REST request; no Google SDK** — learner-selected to keep the function small and avoid an SDK dependency. The function owns response parsing and runtime validation.
- **No database or persistence service** — follows the approved PRD: page state lives in React memory and resets on refresh.
- **Wrangler CLI and Cloudflare Vite plugin** — run the Worker and static assets locally and deploy them together as a Worker. [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

Use the Node.js LTS available during the build and commit the generated package lockfile so dependency versions used by the project are reproducible. Check current Vite and Wrangler compatibility during setup; no package versions are pinned by this spec.

## Where It Runs and How Someone Tries It

The page and `/api/analyze` run together as one Cloudflare Worker with Static Assets. A local run needs Node.js, npm, Wrangler, and a Gemini API key. A Google AI Studio free-tier key is supplied locally through an ignored `.dev.vars` file as `GEMINI_API_KEY="..."`; never put it in a `VITE_` variable, browser code, or committed Wrangler configuration. Set `GEMINI_MODEL` as a server-side Worker variable, initially `gemini-3.8-flash`.

From the project root, the full local preview is:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The Cloudflare Vite plugin runs the SPA and Worker route together. Use `npm run build` and `npm run preview` for a production-like local check.

Deploy the Worker with `npx wrangler deploy`. Keep `GEMINI_API_KEY` as a Worker secret (for example, `npx wrangler secret put GEMINI_API_KEY`) and configure `GEMINI_MODEL` as a server-side Worker variable. Configure secrets for each deployment environment as appropriate. [Workers deployment](https://developers.cloudflare.com/workers/wrangler/commands/#deploy), [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

Submission still requires a short demo video and a public GitHub repository. The deployed Worker URL is useful for trying the app but does not replace either deliverable.

## Look and Feel

Use a calm, light, spacious page with a modern sans-serif typeface and restrained colors. Make the two checklist sources visually distinct through section headings and subtle color treatment. Give titles, categories, source excerpts, progress, and status labels a clear hierarchy. Make **Needs review** noticeable without styling it like a broken/error state. Keep the privacy notice short and visible near the paste field; no consent screen or privacy settings. This carries forward `prd.md > Look and Feel` and the privacy addition under `prd.md > Screens and Layout`.

## Components

### Submission Lens page (`src/App.tsx`)

Owns the pasted text, loading/error/result states, checkbox state, and remaining-work summary. It shows the privacy notice and switches from the initial form to results within the same page. It clears all in-memory state on a full page refresh.

Implements `prd.md > The Core Journey`, `prd.md > Screens and Layout`, and `prd.md > States and Boundaries`.

### Organizer requirements list (`src/components/RequirementsList.tsx`)

Renders each server-returned item with its title, category, checkbox, certainty/review status, and verified excerpt. When the server returns no verified excerpt, show “No matching source excerpt found” instead of the model's unmatched text. Checking an uncertain item is allowed and counts it as complete, as required by the PRD.

Implements `prd.md > Analyze pasted rules` and `prd.md > Review and complete checklists`.

### Submission safety checklist (`src/components/SafetyChecklist.tsx`)

Renders the fixed recommendations: open production URLs while logged out; confirm the repository is public; check for exposed secrets; confirm build and test status; check licenses; reopen final submission links. These are client-owned items and are never sent to Gemini.

Implements `prd.md > Review and complete checklists`.

### Progress summary (`src/components/ProgressSummary.tsx`)

Shows completed/total counts per section and the remaining organizer and safety item counts. Counts are derived from current items and checkbox state, not maintained separately.

Implements `prd.md > Review and complete checklists`.

### Analyze request helper (`src/lib/analyze.ts`)

Sends the pasted text to same-origin `POST /api/analyze`, decodes the JSON response, and surfaces a controlled error to the page on non-success or invalid data. It does not call Gemini directly.

Implements `prd.md > Analyze pasted rules` and `prd.md > States and Boundaries`.

### Shared analysis contract (`src/shared/analysis.ts`)

Defines TypeScript types, the Gemini JSON schema, and a small runtime validator for the expected item fields and category/certainty values. The Worker parses Gemini's JSON text and rejects missing, wrongly typed, or unexpected data; it does not guess, repair, or retry malformed requirements.

Implements `prd.md > Analyze pasted rules`.

### Analysis Worker route (`worker/index.ts`)

Accepts only `POST` JSON, validates the input, calls Gemini with the server-side key and configured model, parses and validates the structured response, and verifies excerpts. Invalid/unmatched excerpts force **Needs review**; the unmatched excerpt is discarded and represented as absent. It returns the validated analysis or a controlled error. It does not save or log pasted rules, and sends `store: false` to Gemini.

Implements `prd.md > Analyze pasted rules` and `prd.md > States and Boundaries`.

## Data Model

### Input limit

Set a maximum of 50,000 characters for pasted rules. Use the same small counting helper (`Array.from(text).length`, counting Unicode code points) in the client and Worker. Above the limit, the client shows “Rules must be 50,000 characters or fewer.” and does not make a request; the Worker independently enforces the same cap before calling Gemini and returns a controlled `413` input-too-long response. Preserve the pasted text so it can be shortened.

### Request and response

The browser sends:

```json
{ "text": "Pasted hackathon rules..." }
```

A successful function response is:

```json
{
  "requirements": [
    {
      "id": "0",
      "title": "Upload a demo video under 3 minutes",
      "category": "Video",
      "sourceExcerpt": "Submit a demo video of no more than three minutes.",
      "needsReview": false
    }
  ]
}
```

Categories are `Deadline`, `Deliverable`, `Repository`, `Video`, `Eligibility`, or `Other`. Gemini returns `certainty` (`clear` or `uncertain`) and a string `sourceExcerpt`; the function derives `needsReview` as true when Gemini marks it uncertain or the excerpt fails verification. It sets a stable-in-response array-index `id`. For an unmatched excerpt, the returned `sourceExcerpt` is `null`; the UI displays the prescribed “No matching source excerpt found” message. An empty `requirements` array means no organizer requirements were identified; the client still displays the safety list.

The Gemini schema marks every field required, uses enums for category and certainty, and disallows additional object properties. It asks the model to quote contiguous source wording and mark ambiguity uncertain. This controls shape and guides the model; text content is still explicitly parsed and checked by the function.

### Where state lives

- **Pasted input, analysis response, loading/error state, and checkbox values:** React memory in the open page. Analyze replaces the current result; checkboxes update in place. Refresh clears the current session.
- **Safety checklist definitions:** a static TypeScript constant in `src/data/safetyChecks.ts`. Completion values live only in React memory.
- **Gemini key and model selection:** server environment only. `GEMINI_API_KEY` is a Cloudflare secret (and a local `.dev.vars` secret); `GEMINI_MODEL` is a server-side variable. Neither is bundled into client assets.
- **Database or browser persistence:** none.

### Source excerpt verification

Normalize the pasted source and returned excerpt by trimming the ends and replacing each run of whitespace with one ordinary space. If the normalized non-empty excerpt is not a substring of the normalized source, set `needsReview: true`, set `sourceExcerpt: null`, and do not return or display the unmatched model text. If the excerpt matches but Gemini marks the item uncertain, keep the verified excerpt and show **Needs review**. An exact quote match proves only that the excerpt occurs in the source; semantic interpretation remains model-derived.

## File Structure

```text
submission-lens/
├── worker/
│   └── index.ts                # Worker API route: validate, call Gemini, verify excerpts
├── src/
│   ├── components/
│   │   ├── ProgressSummary.tsx # Per-section and overall remaining counts
│   │   ├── RequirementsList.tsx# Organizer items and review markers
│   │   └── SafetyChecklist.tsx # Fixed general recommendations
│   ├── data/
│   │   └── safetyChecks.ts     # Fixed safety item definitions
│   ├── lib/
│   │   └── analyze.ts          # Same-origin API client and response guard
│   ├── shared/
│   │   └── analysis.ts         # Shared types, JSON schema, runtime validation
│   ├── App.tsx                 # Single-page flow and transient UI state
│   ├── main.tsx                # React entry point
│   └── styles.css              # Calm, light visual system
├── devpost/                    # Scope, PRD, technical spec, learner profile
├── .dev.vars                   # Local Gemini secret; ignored and created by learner
├── .gitignore                  # Must ignore .dev.vars files and credentials
├── index.html                  # Vite HTML entry
├── package.json                # Scripts and dependencies
├── package-lock.json           # Reproducible npm dependency versions
├── tsconfig.json               # TypeScript settings
├── vite.config.ts              # Vite configuration
└── wrangler.jsonc              # Worker Static Assets, SPA fallback, and GEMINI_MODEL variable
```

## External Services and Dependencies

### Gemini API

- **Call:** HTTPS `POST https://generativelanguage.googleapis.com/v1beta/interactions` from the Worker only.
- **Authentication:** send `x-goog-api-key: {GEMINI_API_KEY}` from the Worker secret. Never send the key or call the provider from browser code.
- **Request:** use direct `fetch` with the configured server-side model, one text input containing the extraction instructions and pasted rules, `store: false`, and a top-level `response_format` object containing the shared JSON Schema. The pasted block is untrusted input data, not instructions to follow. No search, tools, grounding, or file upload is used.

  ```json
  {
    "model": "gemini-3.8-flash",
    "input": "<fixed extraction instructions and pasted rules>",
    "store": false,
    "response_format": {
      "type": "text",
      "mime_type": "application/json",
      "schema": {
        "type": "object",
        "properties": {
          "requirements": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": { "type": "string" },
                "category": { "type": "string", "enum": ["Deadline", "Deliverable", "Repository", "Video", "Eligibility", "Other"] },
                "sourceExcerpt": { "type": "string" },
                "certainty": { "type": "string", "enum": ["clear", "uncertain"] }
              },
              "required": ["title", "category", "sourceExcerpt", "certainty"],
              "additionalProperties": false
            }
          }
        },
        "required": ["requirements"],
        "additionalProperties": false
      }
    }
  }
  ```

- **Response:** inspect the completed interaction's `steps`, select its model-output text content, parse it as JSON, validate it against the shared schema, then verify each excerpt before returning anything to the browser. Do not assume an SDK-only convenience property in the REST response. Treat provider errors, incomplete interactions, empty text, malformed JSON, schema mismatch, and refusal as controlled analysis failures; do not return provider internals or raw invalid model text.
- **Model:** `GEMINI_MODEL`, defaulted to `gemini-3.8-flash` in server configuration. Do not accept a model name from the browser.
- **Cost and data use:** the learner chose the Gemini free tier for this POC. Free-tier availability and per-model request/token limits can change; check the live quota in AI Studio during setup. Google currently states that free-tier prompts may be used to improve its products, while paid-tier prompts are not. The page warns against confidential, sensitive, or personal input. Before operating as a production service, move to a paid-tier Gemini project as the learner requested. `store: false` prevents interaction state from being stored by the API. [Gemini pricing and data use](https://ai.google.dev/gemini-api/docs/pricing), [current model list](https://ai.google.dev/gemini-api/docs/models), [Interactions API](https://ai.google.dev/api/interactions-api).
- **Schema details:** the schema is kept shallow and within documented structured-output constraints, then explicitly validated at runtime. Confirm the exact schema is accepted by the selected model during the first live build call. [Structured output support](https://ai.google.dev/gemini-api/docs/structured-output), [Interactions API](https://ai.google.dev/api/interactions-api).

### Cloudflare Workers and Static Assets

- The Cloudflare Vite plugin runs the React SPA and Worker route locally and deploys them together. Configure `wrangler.jsonc` with `main: "./worker/index.ts"`, Static Assets output from the Vite build, SPA fallback, and Worker-first routing for `/api/*`. The Worker implements only `POST /api/analyze`; other API paths return a controlled not-found response. Static files are served through the assets binding. Keep the public route simple; because there is no login or rate-limit service, anonymous callers could consume free-tier quota. A quota failure is reported as a short retryable error. [Cloudflare Vite plugin tutorial](https://developers.cloudflare.com/workers/vite-plugin/tutorial/), [Static Assets](https://developers.cloudflare.com/workers/static-assets/), [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

## Important Failure Modes

- **Empty input** → the page shows the PRD inline prompt and does not call the Worker.
- **Input exceeds 50,000 characters** → the client shows an inline limit message and makes no request; the Worker independently rejects oversized requests with a controlled 413 response if called directly. The pasted text remains available to shorten.
- **Gemini quota, network, refusal, or service error** → show a short retryable analysis error; keep pasted text and current page content. Do not expose API keys or raw provider errors.
- **Malformed JSON or schema mismatch** → return a controlled analysis error; do not attempt to repair or infer requirements.
- **Excerpt not found after whitespace normalization** → return the requirement as **Needs review**, omit the unverified excerpt, and show “No matching source excerpt found.”
- **Valid response with no requirements** → show the no-event-requirements message and the built-in safety checks.

## What Was Simplified and Why

- **One Worker route** instead of a separate API server — the workflow needs one server-side operation, and Workers Static Assets serve it alongside the Vite page.
- **One Gemini request per Analyze action** instead of multiple model calls or a review workflow — keeps the demonstration short and the free-tier request count low.
- **Direct REST `fetch`** instead of a provider SDK — the learner chose fewer dependencies and accepted explicit parsing/validation in the function.
- **In-memory state and static safety items** instead of a database, accounts, or saved projects — refresh-reset behavior is approved and personalization is deferred.
- **Whitespace-normalized exact excerpt matching** instead of semantic similarity or fuzzy matching — the learner chose a lightweight deterministic check; ambiguous semantics remain visibly uncertain.
- **Free-tier privacy notice** instead of consent settings — the learner accepts free-tier data use for public rules in this POC and chose a short warning. A production service should use the paid tier.

## Decisions and Open Issues

- **Input limit:** cap pasted rules at 50,000 characters in both client and Worker; oversized text never reaches Gemini.

- **Learner choices:** Vite, React, TypeScript, Cloudflare Workers with Static Assets and one route, Gemini 3.8 Flash, no database, free tier for the POC, a server-only API key, a configurable server-side model name, schema-constrained JSON, and a REST `fetch` call without the Google SDK.
- **Output handling:** malformed or schema-invalid Gemini responses produce a controlled error, not repair or guesswork. A missing/unmatched excerpt marks the requirement **Needs review** and the quote is suppressed.
- **Privacy:** show a short warning not to paste confidential, sensitive, or personal information; no consent flow or settings. Use a paid-tier Gemini project before production service operation.
- **Useful technical distinction clarified:** structured output constrains response shape, not truth. Exact whitespace-normalized excerpt matching checks provenance of the quote but not semantic correctness of the title; the prompt must still mark ambiguous text uncertain, and this limitation should be kept visible during build review.
- **Build-time checks:** confirm the exact JSON Schema is accepted by `gemini-3.8-flash`, confirm current free-tier quota for the learner's key in AI Studio, and try explicit, ambiguous, and absent requirements. No unresolved product decision blocks the build.
