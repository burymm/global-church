да# Global Church — AI Agent Instructions

## Project
Mobile PWA app for Christians to connect. React + TypeScript + Vite + Tailwind + Leaflet + Supabase.

## Git — NEVER commit or push without explicit permission
**NEVER commit, push, or deploy unless the user explicitly says "commit" and "push" (or "deploy").**
- After completing work, show what was done and wait for the user's command.
- Do NOT assume that finishing a task means you can commit — always ask first.
- This rule applies to all git operations: commit, push, deploy, merge, PR creation.

## Commit Format

Commits follow a numbered format:

- Bugs: `[bug-<number>] - <description>`
- Tasks/features: `[task-<number>] - <description>`

Examples:
```
[bug-01] - fix language resets to russian
[task-11] - added user profile settings, fixed some errors
```

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Router v7
- **Maps:** Leaflet + OpenStreetMap (not Google Maps)
- **Backend:** Supabase (Auth + PostgreSQL + Realtime) — no Node.js server needed
- **i18n:** i18next (ru default, be, en)
- **PWA:** vite-plugin-pwa

## Architecture
- All external APIs abstracted via interfaces in `src/services/`
- Providers in `src/providers/` (currently Supabase + Leaflet + Browser Geolocation)
- Store files in `src/store/` (Zustand)
- Pages in `src/pages/`
- Components in `src/components/`

## Supabase
- Database schema: `supabase/schema.sql`
- Auth via Google OAuth
- Realtime subscriptions on `messages` and `user_locations` tables
- RLS enabled on all tables

## Code Style
- TypeScript with strict mode
- **Always use semicolons** at the end of statements, variable declarations, arrow function expressions, interface/property declarations, and import/export statements
- No comments explaining WHAT (code is self-documenting)
- Only add comments for WHY (non-obvious decisions, constraints)
- No error handling for scenarios the framework covers
- File names: camelCase (`authStore.ts`, `mapPage.tsx`)
- Components: PascalCase

## Branches
- `master` — main branch (production-ready)
- `dev` — development branch
- `feature/*` — optional for large changes

## Dev
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## MCP Tools
- chrome-devtools — agent can see the app in browser
- context7 — documentation lookup
