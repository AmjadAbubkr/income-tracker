# ROADMAP: IncomeTrack — 100% Offline Local Architecture

This roadmap tracks the development of the client-side local-only app. The backend Hono server and remote PostgreSQL migration have been decommissioned.

## Status

The app remains intentionally local-only and IndexedDB-backed. An audit found
release-blocking correctness, privacy, and completion gaps; Phases 9 and 10
close those gaps before this milestone can be considered complete.

- [x] **Phase 1: Local Authentication & Sign-in Shell** — Offline sign-up, sign-in, session caching in localStorage, and user ID data scoping.
- [x] **Phase 2: Product & Inventory Catalog** — CRUD operations, custom categories, stock level indicators, local React hooks.
- [x] **Phase 3: Sales Recording** — Batch cart checkout, daily transaction tracking.
- [x] **Phase 4: Expense Log** — Categorized business costs logging.
- [x] **Phase 5: Subscriptions & Recurring Logic** — Automated billing simulation generating local records.
- [x] **Phase 6: Visual Aesthetics & Dashboard** — Clean Slate theme (Stitch "Executive Precision"), analytics graphs, tabular numerals alignment.
- [x] **Phase 7: Local Settings** — Multi-language (EN/FR/AR), RTL overrides, currency codes, dark mode toggle.
- [x] **Phase 8: Reporting & Backup** — Excel generation, full offline JSON export and import.

## Final Milestone: Decouple Hono Server

The current task is to complete the decoupling of any remaining server endpoints:
1. Upgrade IndexedDB schema to store categories locally.
2. Direct all client API actions (`src/api/*`) to query the offline database.
3. Verify Vite bundle compiles and runs cleanly.

## Remediation Milestone

- [x] **Phase 9: Release Safety and Data Correctness** - Restore a strict
  TypeScript baseline, protect local-profile isolation, use exact money values,
  and make checkout, subscription processing, and backup restore safe and
  atomic. Add regression coverage for those critical paths.
- [ ] **Phase 10: Complete Remaining v1 Workflows** - Finish sales and expense
  management, dashboard/reporting requirements, notifications, profile editing,
  and complete EN/FR/AR UI coverage.

---
*Last updated: 2026-05-20 (Decommissioned server roadmap)*
