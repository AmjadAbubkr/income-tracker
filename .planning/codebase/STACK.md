---
title: Tech Stack
last_updated: 2026-05-17
scope: full-repo
---

# STACK.md — Technology Stack

## Languages & Runtime

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | — |
| Runtime | Browser (client-side only) | — |
| Module System | ES Modules (via Vite) | — |

## Frameworks & Libraries

| Category | Library | Purpose |
|----------|---------|---------|
| UI Framework | React 18+ | Component-based UI |
| Build Tool | Vite | Fast dev server & bundler |
| Spreadsheet Export | `xlsx` (SheetJS) | Excel export functionality |
| Styling | Plain CSS | `App.css`, `mobile.css` — no CSS-in-JS or preprocessor |

## Data Layer

| Technology | Purpose |
|------------|---------|
| IndexedDB | Primary persistent storage via custom `Database` class in `src/utils/database.ts` |
| localStorage | Session persistence (`user_email_session`, `theme`, `language`) |

## Key Dependencies (inferred from imports)

- `react` / `react-dom` — UI framework
- `xlsx` — Excel export in `src/utils/export.ts`
- No router library — navigation handled via component state (`currentView` in `App.tsx`)
- No state management library — all state via React `useState`/`useContext`

## Configuration

- **No `package.json` found at project root** — dependencies inferred from import statements
- `node_modules/` present, indicating npm/yarn/pnpm was used at some point
- Vite entry point: `src/main.tsx`
- TypeScript config inferred from `.ts`/`.tsx` extensions and `vite-env.d.ts`

## Build & Dev Tools

- Vite (inferred from `vite-env.d.ts` and standard React+TS project structure)
- TypeScript compiler (tsc) for type checking
