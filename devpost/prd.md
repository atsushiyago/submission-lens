---
doc: prd
status: approved
---

# Submission Lens — Product Requirements

A focused web app for hackathon participants that turns pasted organizer rules into a checkable submission list alongside general safety recommendations.
Source: `scope.md > Who It's For`, `scope.md > The Unique Kernel`.

## The Core Journey

1. The participant opens Submission Lens and sees a short explanation, a large rules text area, and an **Analyze** button.
2. They paste hackathon rules or submission requirements and choose **Analyze**.
3. Submission Lens presents organizer requirements grounded in the pasted text, with categories, source excerpts, completion boxes, and a visible uncertainty status wherever the source is unclear.
4. A separate Submission Safety Checks section presents fixed general recommendations, not organizer requirements.
5. As the participant checks items, section progress and a page summary update immediately. They can see what remains incomplete.

Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`, `scope.md > The POC Boundary`.

## Screens and Layout

One page contains the full workflow. Before analysis, the main content is the product name, a short explanation of the app and its two checklist sources, the large paste area, and the Analyze button. No extra setup or configuration is shown. Include a short privacy notice: “Do not paste confidential, sensitive, or personal information.” No consent flow or privacy settings.

After analysis, the page shows a compact summary of remaining work, followed by two clearly separated sections: **Organizer Requirements** and **Submission Safety Checks (general recommendations)**. Organizer items show an actionable title, category, completion checkbox, and short source excerpt. Uncertain items have a visible **Needs review** or **Uncertain** label. Safety items show their recommendation and checkbox. Each section shows a completed/total count.

Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## Look and Feel

A clean, calm, trustworthy productivity tool: light interface, generous whitespace, modern sans-serif typography, and clear hierarchy between headings, checklist items, excerpts, and status labels. Use a restrained palette to distinguish the two sections. Uncertainty should be noticeable without resembling a technical error.

Source: learner's PRD interview response.

## Features and Behavior

### Analyze pasted rules

- The participant can paste hackathon rules or submission requirements into the text area and start analysis with **Analyze**.
- Limit pasted input to 50,000 characters. If the limit is exceeded, show a clear inline message and do not send an analysis request.
- Organizer requirement items use concise, actionable wording and one category: Deadline, Deliverable, Repository, Video, Eligibility, or Other.
- Each organizer item includes a short excerpt from the pasted source that supports it.
- The analyzer must not invent organizer requirements. If wording is unclear or support is insufficient, show the item as **Uncertain** or **Needs review**, retain the relevant excerpt, and do not present it as definite.
- Keep the result scannable; do not show lengthy AI-generated explanations.

Acceptance criteria:
- Given pasted rules with an explicit deadline or deliverable, the results show an actionable organizer item, an appropriate category, and its supporting source excerpt.
- Given ambiguous wording, the related item is visibly marked uncertain and includes the relevant excerpt.
- No organizer requirement is presented as definite without support in the pasted text.

Source: `scope.md > The Unique Kernel`, `scope.md > The POC Boundary`.

### Review and complete checklists

- Show organizer requirements and general safety checks in separate, clearly labeled sections.
- The fixed safety recommendations cover the learner's established checks: open production URLs while logged out, confirm repository visibility is public, check for exposed secrets, confirm build and test status, check licenses, and reopen final submission links.
- Each item can be checked off. Uncertain organizer items remain incomplete until explicitly checked.
- Each section displays completed items out of its total (for example, “4 of 6 complete”). Checked items appear visually muted; unchecked items remain prominent.
- A summary near the top updates immediately to show the number of remaining organizer requirements and safety checks.

Acceptance criteria:
- Checking or unchecking an item immediately updates its section count and the page-level remaining counts.
- An uncertain organizer item does not count as complete until the participant checks it.
- Safety checks are labeled as general recommendations, not requirements extracted from organizer rules.

Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, `scope.md > Why This Matters to the Learner`.

## States and Boundaries

- **Before analysis** — show the initial paste-and-analyze page; no result checklist is shown.
- **Empty input** — show an inline message near the input: “Paste some hackathon rules or submission requirements before analyzing.”
- **Input exceeds 50,000 characters** — show a clear inline message near the input, such as “Rules must be 50,000 characters or fewer.” Do not send an analysis request; keep the pasted text so the participant can shorten it.
- **No organizer requirements found** — say that no event-specific requirements were identified from the pasted text. Do not invent organizer items. Still show the separate general Submission Safety Checks section.
- **Analysis failure** — show a short technical error message and allow retry while preserving the pasted text. Do not add a separate error screen or troubleshooting flow.
- **Results** — show organizer requirements (if any) and general safety checks, each with progress, plus the remaining-work summary.
- **Refresh** — resetting the page clears the current analysis results and checklist progress; nothing needs to survive a browser refresh.

Source: `scope.md > The Core Loop`, `scope.md > The POC Boundary`; learner's PRD interview responses.

## Product Decisions

- Keep the experience to one page with paste-and-analyze as the obvious starting action; extra settings and configuration are out of the MVP. Include a brief free-tier data-use notice without a separate consent flow or privacy settings.
- Keep organizer requirements separate from fixed general safety recommendations.
- Mark uncertain source text instead of claiming it as a definite requirement; show its excerpt so the participant can judge it.
- Keep output concise and progress visible through simple counts; omit charts, scores, badges, and gamification.
- When no organizer requirements are found, still show safety checks so the page remains useful without fabricating event-specific items.
- Refreshing resets the current analysis and checklist progress; cross-refresh persistence is outside the POC.

## What We're Building

A single-page web app that accepts pasted rules, analyzes them into source-backed and uncertainty-labeled organizer checklist items, shows a separate fixed safety checklist, and updates per-section and overall remaining counts as items are checked.

## Deferred From the POC

- Custom safety check editing and saved preferences: the first version uses a fixed set to keep the workflow small.
- Saved projects: the participant only needs the current checklist flow for the demo.

## Possible Later Enhancements

Participants may be able to customize safety checks or save projects if the core workflow proves useful.

## Non-Goals

- Accounts or user profiles: unnecessary for the single-session proof of concept.
- URL scraping, PDF upload, browser extensions, calendar integration, or notifications: pasted text is enough to prove the core idea.
- Long AI explanations, charts, scores, badges, or gamification: clear checklist items and counts are sufficient.
