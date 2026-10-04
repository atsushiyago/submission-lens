# Submission Lens

Submission Lens turns pasted hackathon rules into a checkable list of organizer requirements, with source excerpts and uncertainty labels. A separate fixed checklist provides general submission safety recommendations.

## Run locally

Requirements: Node.js, npm, and a Gemini API key. The local Cloudflare Worker reads secrets from `.dev.vars` in the project root. Create that ignored file with:

```dotenv
GEMINI_API_KEY="your-gemini-api-key"
# Optional; defaults to gemini-3.6-flash
GEMINI_MODEL="gemini-3.6-flash"
```

Install dependencies and start the app:

```sh
npm install
npm run dev -- --host 127.0.0.1
```

Open the local URL printed by Vite. Do not commit `.dev.vars` or put the Gemini key in a `VITE_` variable. The application sends pasted text to Gemini for analysis. The POC uses Gemini's free tier, so do not paste confidential, sensitive, or personal information.

## Verify

```sh
npm test
npm run typecheck
npm run build
```

## Deploy (optional)

The app is a Cloudflare Worker with Static Assets. Build the app and deploy the generated Worker configuration:

```sh
npm run build
npx wrangler deploy --config dist/submission_lens/wrangler.json
```

On first deployment, set the server-side secret after the Worker is created:

```sh
npx wrangler secret put GEMINI_API_KEY
```

The secret becomes active immediately. Keep `GEMINI_MODEL` as a server-side variable; it defaults to `gemini-3.6-flash` and has no automatic fallback. No database is used.

## Planning documents

The approved product boundary, behavior, and architecture are documented in [`devpost/scope.md`](devpost/scope.md), [`devpost/prd.md`](devpost/prd.md), and [`devpost/spec.md`](devpost/spec.md). The build checkpoints are in [`devpost/checklist.md`](devpost/checklist.md); [`devpost/app-map.html`](devpost/app-map.html) maps the implementation. The private learner profile is intentionally ignored by Git and should not be published.
