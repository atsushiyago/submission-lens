---
doc: checklist
status: approved
---

# Build Checklist

Build mode: pending learner choice

## Slices

- [ ] **1. Paste rules and review grounded organizer requirements**
  Becomes usable: A runnable Submission Lens page accepts up to 50,000 characters of rules, analyzes them through the server-only Gemini route, and shows validated organizer requirements with category, completion control, source excerpt, and review status.
  Why now: This proves the riskiest and most distinctive path first: turning pasted text into a grounded, uncertainty-aware checklist. Project setup is included here so the first step delivers behavior rather than scaffolding alone.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Analyze pasted rules`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Components`, `spec.md > Data Model`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`, `spec.md > File Structure`
  Build: Scaffold Vite + React + TypeScript with the Cloudflare Vite plugin and one Worker route. Add the paste form, privacy notice, client and server length checks, `/api/analyze`, Gemini Interactions REST request using `GEMINI_MODEL`, `store: false`, schema-constrained output, explicit response parsing/runtime validation, and normalized source-excerpt verification. Keep error handling controlled and preserve input on retry.
  Verify (mechanical): Run deterministic tests with fixed fixtures for malformed structured output, schema mismatch, excerpt mismatch (including quote suppression), and server-side over-limit input. Run `npm run typecheck` and `npm run build`. With the configured Gemini key, perform one short live happy-path smoke test: submit a short rules excerpt, receive a valid structured response, verify its source excerpt, and render the result. Keep the key and input out of logs and commits.
  Learner check: Open the app, paste a short rules excerpt with one clear requirement, analyze it, and check whether the category, source quote, uncertainty treatment, and privacy note match what you expected. Also try text over the limit and confirm it stays in the box with an inline message and no analysis request.
  Commit: `Build grounded organizer analysis flow`

- [ ] **2. Complete the two-source checklist and progress experience**
  Becomes usable: Organizer requirements appear alongside the fixed, clearly labeled safety recommendations, with per-section completion counts and a live remaining-work summary. Empty extraction still leaves useful safety checks visible.
  Why now: Once the evidence-backed organizer list works, this completes the unique kernel by bringing the two sources together and makes the main demo journey usable without adding persistence or customization.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`, `prd.md > Review and complete checklists`, `prd.md > States and Boundaries`, `prd.md > What We're Building`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Components`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Add the six fixed safety recommendations, their checkbox state, section progress, overall remaining counts, no-requirements message, and final responsive visual hierarchy. Keep all state in React memory and ensure refresh resets it.
  Verify (mechanical): Run `npm run typecheck` and `npm run build`; start the local Worker/asset app and verify checklist counts update when organizer and safety items are checked and unchecked, including an empty-requirements result.
  Learner check: In the running app, complete and uncheck one organizer item and one safety check. Confirm the counts and remaining summary update immediately, the two sections remain distinct, and no-requirements results still show general safety recommendations.
  Commit: `Add safety checks and live progress`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after Slice 1, before final visual refinement.
- [ ] Final kick-the-tires exploration and feedback completed — after Slice 2.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — focused alternative or brief evidence-based recap for an experienced plan-first user
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions
