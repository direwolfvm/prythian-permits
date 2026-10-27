# CLAUDE.md

## Project Overview

Prythian Permits is a fantasy-themed permitting and environmental review portal set in the world of A Court of Thorns and Roses (ACOTAR). It is a reskin of the HelpPermit.me demo, replacing real-world agencies with Prythian Courts and environmental review with "Weave Review."

## Tech Stack

- React 19 + Vite 7 + TypeScript
- Express server (production + API proxy)
- CopilotKit (AI sidebar)
- RJSF (React JSON Schema Form)
- USWDS (base styling) + CSS custom properties (Court themes)
- Supabase (PostgreSQL backend)
- Recharts (analytics)

## Common Commands

All commands run from the `app/` directory:

```bash
cd app
npm install                    # Install dependencies
npm run dev                    # Start Vite dev server (localhost:5173)
npm run build                  # Type-check and build for production
npm run lint                   # Run ESLint
npm test -- --run              # Run Vitest suite once
npm test                       # Run Vitest in watch mode
npm run start                  # Start production Express server
```

## Domain Terminology

| Real-world | Prythian |
|------------|----------|
| Agency | Court |
| Applicant | Petitioner |
| Permit | Decree |
| Project | Petition |
| NEPA / Environmental Review | Weave Review |
| Office / Bureau | Court Stewards |
| Sponsor | Patron |
| Pre-screening | Augury |

## Architecture

```
app/
├── src/
│   ├── components/         # React components
│   ├── content/            # Domain content (courts, terminology)
│   ├── schema/             # RJSF form schema
│   ├── utils/              # Business logic, screening, persistence
│   ├── types/              # TypeScript types
│   ├── styles/             # CSS tokens and themes
│   ├── App.tsx             # Router and layout
│   ├── PortalPage.tsx      # Main form page with CopilotKit
│   └── main.tsx            # Entry point
├── server.mjs              # Express server
└── package.json
supabase/
├── migrations/             # SQL migrations
└── seed.sql                # Sample Prythian data
```

## Supabase Setup

The target Supabase project uses env vars with VITE_ prefix in `app/.env`.
Run migrations from `supabase/migrations/` in order, then run `supabase/seed.sql`.

## Theme System

7 Court themes selectable in Settings: night (default), spring, summer, autumn, winter, day, dawn.
Implemented via `data-design-theme` attribute on `<html>` and CSS custom properties in `styles/tokens.css`.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created when first needed. See `docs/agents/domain.md`.

### Other skills

`code-simplification` and `code-review-and-quality` (from addyosmani/agent-skills) need no repo setup. They follow the conventions in this file.
