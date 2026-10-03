---
doc: scope
status: approved
---

# Submission Lens

A web app that turns pasted hackathon rules into an actionable checklist, alongside a separate set of general submission safety checks.

## The Unique Kernel
One checklist brings together two clearly labeled sources of attention: organizer requirements extracted from the event rules, and fixed general safety recommendations drawn from the learner's submission experience.

## Who It's For
Hackathon participants preparing a project submission. They need to catch event-specific requirements and practical final checks, which can otherwise be scattered across long rules and a personal manual checklist.

## The Core Loop
Paste the rules, analyze them, review the structured organizer requirements next to the general safety checks, and check off completed items to see what remains.

## Inspiration & Identity
Not established.

## Why This Matters to the Learner
The learner has submitted several hackathon projects and has personally found it easy to miss details even when the project itself is finished. They already check production URLs while logged out, repository visibility, exposed secrets, build and test status, licenses, and final links.

## What "Working" Looks Like
In a short demo, a participant pastes a block of rules, clicks Analyze, sees event-specific requirements (such as deadlines, required files, repository and video rules, and warnings) separated from general safety checks, then checks items off and sees what remains incomplete. The rules becoming a clear, actionable checklist is the key moment.

## The POC Boundary
A small web app for pasting rules, analyzing their text, presenting a structured, checkable organizer checklist alongside fixed general safety checks, and showing completion state. The safety checks are recommendations, clearly distinguished from organizer requirements. Unclear or uncertain source text must be labeled as uncertain rather than presented as a definite organizer requirement; the PRD will define the behavior.

## Later
Customizing or editing safety checks; saved preferences or projects.

## Explicitly Cut
- Accounts and saved projects: not needed to demonstrate the core workflow.
- URL scraping and integrations: the user supplies the text directly.
- PDF upload: paste-text input is sufficient for this proof of concept.
- Notifications: no follow-up system is needed for a short demo.
