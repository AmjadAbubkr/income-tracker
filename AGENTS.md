# IncomeTrack — Agent Guidelines

## Project Context

IncomeTrack is a modern SaaS business income and sales tracking system. Node.js + PostgreSQL backend, React + TypeScript frontend evolved from an existing client-side app. Multi-tenant with full data isolation per business.

See `.planning/PROJECT.md` for full project context.

## GSD Workflow Enforcement

This project uses the Get Shit Done (GSD) workflow for structured planning and execution.

**Rules:**
1. **Never skip planning** — Always use `/gsd-discuss-phase N` → `/gsd-plan-phase N` → `/gsd-execute-phase N` sequence
2. **Never execute without a plan** — Do not write code for a phase until PLAN.md exists
3. **Follow the roadmap** — `.planning/ROADMAP.md` defines phase scope; do not add features outside the current phase
4. **Commit atomically** — Each task in a plan gets its own commit
5. **Verify before marking complete** — Run tests, check success criteria from ROADMAP.md

## Current State

- **Roadmap:** 9 phases defined in `.planning/ROADMAP.md`
- **Requirements:** 39 v1 requirements in `.planning/REQUIREMENTS.md`
- **Research:** Domain research in `.planning/research/`
- **Codebase map:** `.planning/codebase/` documents the existing React SPA

## Tech Stack

- **Backend:** Hono 4.x + Drizzle ORM + Better Auth + PostgreSQL
- **Frontend:** React 19 + Vite + Zustand + TanStack Query
- **Testing:** Vitest
- **Deployment:** Railway (backend) + Vercel (frontend)

## Critical Constraints

- Use `DECIMAL` for all monetary values — never floating point
- PostgreSQL Row-Level Security (RLS) for multi-tenant isolation
- UTC timestamps + IANA timezone names for all date handling
- TypeScript strict mode — no `any` types
