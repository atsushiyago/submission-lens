---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Paste rules and review grounded organizer requirements**
  Becomes usable: A runnable Submission Lens page accepts up to 50,000 characters of rules, analyzes them through the server-only Gemini route, and shows validated organizer requirements with category, completion control, source excerpt, and review status.
  Why now: This proves the riskiest and most distinctive path first: turning pasted text into a grounded, uncertainty-aware checklist. Project setup is included here so the first step delivers behavior rather than scaffolding alone.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Analyze pasted rules`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Components`, `spec.md > Data Model`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`, `spec.md > File Structure`
  Build: Scaffold Vite + React + TypeScript with the Cloudflare Vite plugin and one Worker route. Add the paste form, privacy notice, client and server length checks, `/api/analyze`, Gemini Interactions REST request using `GEMINI_MODEL`, `store: false`, schema-constrained output, explicit response parsing/runtime validation, and normalized source-excerpt verification. Keep error handling controlled and preserve input on retry.
  Verify (mechanical): Run deterministic tests with fixed fixtures for malformed structured output, schema mismatch, excerpt mismatch (including quote suppression), and server-side over-limit input. Run `npm run typecheck` and `npm run build`. With the configured Gemini key, perform one short live happy-path smoke test: submit a short rules excerpt, receive a valid structured response, verify its source excerpt, and render the result. Keep the key and input out of logs and commits.
  Learner check: Open the app, paste a short rules excerpt with one clear requirement, analyze it, and check whether the category, source quote, uncertainty treatment, and privacy note match what you expected. Also try text over the limit and confirm it stays in the box with an inline message and no analysis request.
  Commit: `Build grounded organizer analysis flow`

- [x] **2. Complete the two-source checklist and progress experience**
  Becomes usable: Organizer requirements appear alongside the fixed, clearly labeled safety recommendations, with per-section completion counts and a live remaining-work summary. Empty extraction still leaves useful safety checks visible.
  Why now: Once the evidence-backed organizer list works, this completes the unique kernel by bringing the two sources together and makes the main demo journey usable without adding persistence or customization.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`, `prd.md > Review and complete checklists`, `prd.md > States and Boundaries`, `prd.md > What We're Building`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Components`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Add the six fixed safety recommendations, their checkbox state, section progress, overall remaining counts, no-requirements message, and final responsive visual hierarchy. Keep all state in React memory and ensure refresh resets it.
  Verify (mechanical): Run `npm run typecheck` and `npm run build`; start the local Worker/asset app and verify checklist counts update when organizer and safety items are checked and unchecked, including an empty-requirements result.
  Learner check: In the running app, complete and uncheck one organizer item and one safety check. Confirm the counts and remaining summary update immediately, the two sections remain distinct, and no-requirements results still show general safety recommendations.
  Commit: `Add safety checks and live progress`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after Slice 1, before final visual refinement.
- [x] Final kick-the-tires exploration and feedback completed — after Slice 2.

## Final Review

- [x] Final review complete — user confirmed the final layout and behavior match the approved scope, PRD, and spec; no revisions requested; POC confirmed ready to ship.

## Code Tour and App Map

- [x] Learning activity complete — focused alternative completed through the real Gemini model investigation recorded under `spec.md > Stack`, `spec.md > External Services and Dependencies`, and `Revisions` above.
- [x] Optional edit and transfer reflection addressed — optional transfer question offered with the app map; response is not required.
- [x] `devpost/app-map.html` generated from finished code and checked; shown at the end of the build workflow; includes a project-grounded practice to reuse.

Activity and evidence: Prior focused alternative during build: investigated repeated Gemini 3.8 Flash HTTP 503 high-demand failures, reran the same live sample with 3.6 Flash, and kept the API contract unchanged. Decision and evidence are documented in `spec.md > Stack`, `spec.md > External Services and Dependencies`, and `Revisions`; fixed-fixture tests cover deterministic validation failures. Final review passed with no changes requested.
Route and stops: Reference-only route in `devpost/app-map.html`: `src/App.tsx` (`App`, `handleAnalyze`); `src/lib/analyze.ts` (`analyzeRules`); `worker/index.ts` (`handleAnalyze`) and `src/shared/analysis.ts` (`parseAnalysisText`, `verifySourceExcerpts`).
Edit outcome: No optional code edit was needed or made.
Reflection: Optional transfer question answered; the personal response is stored only in the ignored learner profile.
Activity mode: Prior practice and evidence-based recap; no redundant code tour.

## Revisions

- Use Worker compatibility date `2026-10-01` instead of the environment date — the installed local `workerd` build rejected `2026-10-04` as a future unsupported date; the earlier supported date keeps the planned Worker architecture unchanged.
- Slice 1 checkpoint feedback: organizer analysis works; for Slice 2, increase supporting text, labels, helper text, privacy notice, textarea, and button sizes, and consider a slightly wider main content/card. Keep the headline and behavior unchanged.
- Changed the configurable Gemini default from `gemini-3.8-flash` to `gemini-3.6-flash`: the 3.8 model repeatedly returned an upstream HTTP 503 high-demand response in the live smoke test, while 3.6 completed the same Interactions API, structured-output validation, and source-excerpt verification flow. No automatic model fallback was added; 3.8 can be selected later through `GEMINI_MODEL` if availability improves.
- Slice 2 checkpoint feedback: widen the main/results column, raise checklist/body text to around 16px, keep excerpts and secondary text at 14px or larger, and add vertical space between checklist rows. Preserve behavior, hierarchy, and calm visual style.
- Final visual pass: user confirmed the existing sizing and spacing look good at normal browser text size; no further enlargement requested.
