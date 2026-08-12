# Project Research Summary

**Project:** Income Tracker SaaS
**Domain:** Business income/sales tracking SaaS
**Researched:** 2026-05-17
**Confidence:** HIGH

## Executive Summary

This is a multi-tenant SaaS for tracking business income and sales, targeting freelancers and small business owners. Experts in this domain build these as SPA dashboards with a separate REST API, prioritizing data accuracy (especially financial calculations), tenant isolation, and responsive design. The competitive landscape (Wave Apps, FreshBooks, QuickBooks Self-Employed) shows that users expect transaction CRUD, visual dashboards, categorization, and export capabilities as baseline features.

The recommended approach is a decoupled architecture: a Hono 4.x API on Node.js (Railway) with Drizzle ORM and Better Auth, backed by PostgreSQL, paired with a React 19 SPA (Vite + React Router v7) on Vercel. This stack is the 2026 consensus for greenfield TypeScript SaaS projects — it delivers excellent developer experience, type safety end-to-end, serverless readiness, and avoids the overhead of heavier frameworks like Express or Next.js for this use case.

The key risks are: (1) multi-tenant data isolation failures — mitigated by enforcing `user_id` filtering at the repository level and considering PostgreSQL Row-Level Security; (2) floating-point money errors — mitigated by using PostgreSQL `DECIMAL`/`NUMERIC` types and a library like `dinero.js` for calculations; (3) timezone bugs in financial reporting — mitigated by storing all dates in UTC and converting only at display time. All three are well-understood pitfalls with clear prevention strategies documented in the research.

## Key Findings

### Recommended Stack

The research strongly converges on a modern TypeScript-first stack optimized for developer experience, performance, and future portability. Every major technology choice has HIGH confidence from multiple 2026 sources.

**Core technologies:**
- **Hono 4.x**: API framework — TypeScript-first, ~14KB, ~45K req/s on Node.js, built-in Zod validation, multi-runtime portability
- **Drizzle ORM**: Database access — ~7KB, zero binary deps, SQL-first, excellent TypeScript inference, fast cold starts (<500ms)
- **Better Auth 1.x**: Authentication — framework-agnostic, Drizzle adapter built-in, self-hosted, 28K+ GitHub stars, handles sessions/OAuth/2FA
- **React 19 + Vite 6.x**: Frontend — SPA dashboard, sub-2s dev start, ~42KB bundle (vs ~92KB for Next.js)
- **Tailwind CSS + shadcn/ui**: Styling/components — utility-first CSS with copy-paste customizable components
- **TanStack Query v5 + Zustand**: State management — server state caching + minimal client state (1.2KB combined vs 11KB Redux)
- **Zod 4.x**: Validation — single schema library shared between frontend forms and backend request validation
- **Vitest 4.x + Playwright**: Testing — 3-5x faster than Jest for unit tests, reliable browser automation for E2E
- **PostgreSQL 16+**: Database — ACID-compliant, DECIMAL for money, window functions, row-level security
- **Railway + Vercel**: Deployment — Railway for backend/DB (persistent containers, no cold starts), Vercel for frontend (global CDN)

### Expected Features

The feature landscape clearly separates table stakes (must-have for product credibility) from differentiators (nice-to-have for competitive edge).

**Must have (table stakes):**
- User registration & login — every SaaS needs auth
- Transaction CRUD (add/edit/delete income records) — core value proposition
- Dashboard overview with charts — immediate visual value on login
- Sortable/filterable transaction list — essential data navigation
- Categories/tags — organize income sources
- Date range filtering — period analysis
- Income totals & summaries — financial reporting
- Export to CSV — basic reporting requirement
- Responsive design — mobile/tablet access expected
- Multi-currency support — international users

**Should have (competitive):**
- Recurring income tracking — automates regular entries
- Tax estimation — financial planning value
- Client management — freelancer/business focus
- Goal tracking — user motivation
- Dark mode — user preference
- Real-time notifications — stay informed

**Defer (v2+):**
- Invoice generation — high complexity, not core to income tracking
- Bank statement import — complex CSV parsing + auto-categorization
- Multi-user/teams — requires auth overhaul, defer until single-user validated
- Full accounting system — scope creep (anti-feature)
- Real-time bank sync (Plaid) — expensive, regulatory overhead (anti-feature)

### Architecture Approach

The architecture follows a clean separation of concerns: a client-side SPA communicates via HTTPS/JSON with a Node.js REST API, which connects to PostgreSQL over a private network. Data flows through TanStack Query on the frontend, Hono middleware (auth + validation) on the backend, and Drizzle repositories for database access. The repository pattern keeps database queries isolated from route handlers, and tenant isolation is enforced via `user_id` on every query.

**Major components:**
1. **Frontend App (Vercel)** — UI rendering, routing, form handling, data visualization, client-side caching
2. **Auth Module** — Registration, login, session management, OAuth via Better Auth middleware
3. **Transaction API** — CRUD for income records with Zod validation and Drizzle repository queries
4. **Category/Client APIs** — Supporting CRUD for organizational entities
5. **Dashboard API** — Aggregated metrics using SQL aggregation (not client-side computation)
6. **Export Service** — CSV/PDF generation with streaming for large datasets
7. **PostgreSQL Database** — Persistent storage with foreign keys, indexes, and row-level security

### Critical Pitfalls

1. **Missing Multi-Tenant Data Isolation** — Users seeing other users' data. Prevent with middleware-enforced `user_id` filtering, repository-level scoping, integration tests with multiple users, and PostgreSQL RLS as a safety net.
2. **Floating-Point Money Storage** — JavaScript `number` causes rounding errors in financial calculations. Prevent with PostgreSQL `DECIMAL`/`NUMERIC` types, integer cents storage, and `dinero.js` for calculations.
3. **Session Revocation Not Working** — Stolen tokens remain valid after password change. Prevent with database-backed sessions (Better Auth default), delete all sessions on password change.
4. **Timezone Handling Bugs** — Income totals differ by user timezone. Prevent with UTC storage (`TIMESTAMPTZ`), user timezone in profile, `date-fns-tz` for conversions, display-only timezone conversion.
5. **N+1 Query Problem** — Fetching related data in loops. Prevent with Drizzle joins, repository pattern that fetches related data in single queries.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Auth
**Rationale:** Everything depends on authentication and database schema. Better Auth + Drizzle + PostgreSQL must be wired up before any feature work.
**Delivers:** Project scaffolding, database schema, user registration/login, session management, protected routes
**Addresses:** User registration & login (table stakes)
**Avoids:** Pitfall 3 (session revocation) — use Better Auth database-backed sessions; Pitfall 6 (rate limiting) — enable Better Auth rate limiter plugin; Pitfall 9 (CORS) — configure `@hono/cors` with explicit origins
**Uses:** Hono, Drizzle ORM, Better Auth, Zod, PostgreSQL, Docker

### Phase 2: Transaction Core
**Rationale:** Transaction CRUD is the core value proposition. Must be built before dashboard, charts, or exports can function.
**Delivers:** Transaction CRUD (create, read, update, delete), category management, client management, repository pattern implementation
**Addresses:** Transaction CRUD, categories/tags, client management
**Avoids:** Pitfall 1 (multi-tenant isolation) — enforce `user_id` in every query; Pitfall 2 (floating-point money) — use DECIMAL columns; Pitfall 5 (unindexed FKs) — add indexes during migration; Anti-Pattern 3 (N+1 queries) — use Drizzle joins
**Uses:** Drizzle repositories, Zod validation, TanStack Query mutations

### Phase 3: Dashboard & Visualization
**Rationale:** Depends on transaction data existing. Dashboard aggregates require SQL queries built on Phase 2's schema.
**Delivers:** Dashboard overview with income summaries, charts (line, bar, pie), date range filtering, key metrics
**Addresses:** Dashboard overview, charts/visualizations, date range filtering, income totals & summaries
**Avoids:** Pitfall 4 (timezone bugs) — store UTC, display in user timezone; Pitfall 7 (over-fetching) — use SQL aggregation, not client-side computation
**Uses:** Recharts, TanStack Query caching, SQL `SUM()`/`COUNT()`/`GROUP BY`, `date-fns-tz`

### Phase 4: Reporting & Polish
**Rationale:** Export and responsive design are the last table-stakes features. Can be built once data flows are stable.
**Delivers:** CSV export, responsive design, dark mode, goal tracking, multi-currency support
**Addresses:** Export to CSV, responsive design, dark mode, goal tracking, multi-currency support
**Avoids:** Pitfall 10 (export without auth) — apply auth middleware to export routes; Pitfall 13 (large bundle size) — lazy-load chart components, tree-shake libraries
**Uses:** Streaming CSV generation, Tailwind responsive utilities, Zustand for theme persistence

### Phase 5: Differentiators (v1.1+)
**Rationale:** These features add competitive value but are not required for launch. Build after core product is validated.
**Delivers:** Recurring income tracking, tax estimation, real-time notifications, API access
**Addresses:** Recurring income, tax estimation, notifications, API access
**Uses:** Background workers (Railway cron), email service, REST API documentation via `zod-to-json-schema`

### Phase Ordering Rationale

- **Auth before everything:** No feature can function without user identity and session management. Better Auth also creates the initial database tables.
- **Transaction CRUD before dashboard:** Dashboard visualizations need transaction data to aggregate. The repository pattern established here becomes the foundation for all subsequent data access.
- **Dashboard before exports:** Users need to see their data before they need to export it. Dashboard also validates that aggregation queries work correctly.
- **Polish before differentiators:** All table-stakes features must be complete before adding competitive differentiators. This ensures the product feels "finished" at launch.
- **Grouping by dependency:** Each phase builds on the previous phase's outputs. No phase requires work from a non-adjacent phase.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Dashboard):** Chart library selection (Recharts vs Chart.js) and dashboard UX patterns need validation against actual user workflows
- **Phase 5 (Differentiators):** Tax estimation requires jurisdiction-specific research; recurring income patterns need UX research

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented — Better Auth + Drizzle + Hono integration patterns are established
- **Phase 2 (Transaction Core):** Standard CRUD with repository pattern — extensively documented
- **Phase 4 (Reporting):** CSV export and responsive design are well-understood patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Every technology choice verified against multiple 2026 sources with clear rationale and alternatives considered |
| Features | HIGH | Table stakes validated against competitor analysis (Wave, FreshBooks, QuickBooks); anti-features clearly identified |
| Architecture | HIGH | Clean separation of concerns, well-documented patterns (repository, tenant isolation, optimistic updates) |
| Pitfalls | HIGH | All critical pitfalls have specific, actionable prevention strategies with detection methods |

**Overall confidence:** HIGH

### Gaps to Address

- **Deployment specifics:** Railway vs Render decision is preference-dependent — validate during Phase 1 setup with actual pricing and feature comparison
- **Tax estimation scope:** Jurisdiction-specific complexity deferred to v2+, but early research on target market geography will inform whether this is US-only or multi-region
- **Multi-currency implementation:** Currency conversion API selection (free vs paid) and update frequency need validation during Phase 4
- **PDF export library:** Research identified CSV as straightforward but PDF requires a library — selection (e.g., `@react-pdf/renderer` vs server-side generation) deferred until Phase 4 planning

## Sources

### Primary (HIGH confidence)
- Better Auth official docs (better-auth.com) — auth architecture, session management, plugins
- Hono official documentation — API framework patterns, middleware, validation
- Drizzle ORM documentation — repository patterns, migrations, TypeScript inference
- TanStack Query documentation — caching, mutations, optimistic updates
- PostgreSQL documentation — DECIMAL types, TIMESTAMPTZ, row-level security, indexing

### Secondary (MEDIUM confidence)
- DevTools Guide: Backend Framework Comparison (2026-02) — Hono vs Fastify vs Express
- Bytebase: Drizzle vs Prisma 2026 (2025-05) — ORM performance comparison
- APIScout: Hono vs Fastify vs Express API Framework 2026 (2026-03) — benchmark data
- Railway docs: SaaS Backend with Postgres (2026-03) — deployment patterns
- Competitor analysis: Wave Apps, FreshBooks, QuickBooks Self-Employed — feature expectations

### Tertiary (LOW confidence)
- Indie hacker community patterns — SaaS income tracking conventions (needs validation with actual users)
- Financial dashboard UX best practices — general guidance, domain-specific validation needed

---
*Research completed: 2026-05-17*
*Ready for roadmap: yes*
