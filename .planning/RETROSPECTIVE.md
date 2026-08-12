# Project Retrospective

*A living document updated after each milestone.*

## Milestone: v1.0 — Offline MVP

**Shipped:** 2026-08-12
**Phases:** 10 | **Plans:** 17 | **Sessions:** 1+ continuation runs

### What Was Built

- A fully offline IndexedDB business income tracker with local profiles and
  user-scoped data.
- Product, inventory, sales, expenses, subscriptions, notifications, settings,
  backup, reporting, and profile workflows.
- Release-safety guarantees for exact money, atomic mutations, restore, and
  subscription processing.

### What Worked

- Centralizing reporting calculations prevented dashboard, analytics, and
  export periods from drifting apart.
- Storage-level ownership and transaction checks provided a reliable privacy
  and correctness boundary.
- Targeted regression tests caught the highest-risk financial and profile edge
  cases before the final build gates.

### What Was Inefficient

- Historical backend plans remained in the planning tree after the architecture
  pivot and required retroactive verification records at milestone close.
- The project lacks browser-level E2E coverage, so final verification required
  source review in addition to automated unit/component tests.
- The large application bundle and mixed static/dynamic storage imports remain
  cleanup opportunities.

### Patterns Established

- Persist monetary values as integer minor units only.
- Scope every local record and mutation by the current user ID.
- Use one shared reporting utility for dashboard, analytics, and exports.
- Treat IndexedDB multi-store operations as transactions with pre-validation.

### Key Lessons

1. When an architecture changes, update roadmap, requirements, and verification
   records at the same time as code so milestone closure remains auditable.
2. Financial history edits must reconcile inventory in the same transaction as
   the ledger mutation.
3. Offline PDF delivery can stay dependency-light through a print-ready report.

### Cost Observations

- Model mix: inherited from the session; not tracked in project metadata.
- Sessions: 1 primary implementation run with continuation passes.
- Notable: final verification was fast once shared report and storage helpers
  were centralized.

---

## Cross-Milestone Trends

| Milestone | Phases | Key Change |
|-----------|--------|------------|
| v1.0 | 10 | Completed and verified the offline MVP |

### Cumulative Quality

| Milestone | Tests | Coverage |
|-----------|-------|----------|
| v1.0 | 23 passing | Targeted financial, profile, reporting, localization, and screen contracts |

### Top Lessons

1. Keep the storage boundary authoritative for privacy and financial integrity.
2. Keep product requirements and phase evidence synchronized with architecture.
