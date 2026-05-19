да# Global Church — AI Agent Instructions

## Project
Mobile PWA app for Christians to connect. React + TypeScript + Vite + Tailwind + Leaflet + Supabase.

## Workflow — discuss → approve → code
**Before writing any code for a new feature or bugfix:**
1. First discuss requirements with the user, ask questions, understand the task
2. Create a task/todo list outlining what needs to be done
3. Present the plan to the user and **wait for explicit approval** before writing any code
4. Only start implementing after the user says "go ahead" or equivalent
5. After implementation, run the build and verify before presenting results

This rule applies to ALL code changes — features, bugfixes, refactoring. No code without prior approval.

## Backlog Structure
- `backlog/tasks/` — individual task files (`task-01-*.md`, `task-02-*.md`)
- `backlog/bugs/` — individual bug files (`bug-01-*.md`)
- `backlog/docs/` — project documentation

Create a task or bug file first, then wait for approval before coding.

## Git — NEVER commit or push without explicit permission
**NEVER commit, push, or deploy unless the user explicitly says "commit" and "push" (or "deploy").**
- After completing work, show what was done and wait for the user's command.
- Do NOT assume that finishing a task means you can commit — always ask first.
- This rule applies to all git operations: commit, push, deploy, merge, PR creation.

## Commit Format

Commits follow a numbered format with release-notes-friendly descriptions:

- Bugs: `[bug-<number>] - <short summary>`
- Tasks/features: `[task-<number>] - <short summary>`

Write descriptions as release notes — explain WHAT was added/changed in a way that's useful for a changelog. Include key feature names, not implementation details.

Examples:
```
[bug-01] - fix language resets to russian
[task-11] - added user profile settings with emoji icon, denomination, interests, statuses
[task-01] - added chat feature: mutual readyToChat gate, /chat/:userId routes, message status (sent/delivered/read), delete conversation, ConfirmDialog
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
