# Roadmap: IncomeTrack

IncomeTrack is a local-first business income and sales tracker. The v1
milestone is complete and the shipped architecture is intentionally offline,
with IndexedDB as the authoritative data store.

## Milestones

- [x] **v1.0 Offline MVP** — Phases 1-10, shipped 2026-08-12

## Shipped v1.0 phases

<details>
<summary>v1.0 Offline MVP — SHIPPED 2026-08-12</summary>

- [x] Phase 1: Local Authentication & Sign-in Shell (3 plans) — complete
- [x] Phase 2: Product & Inventory Catalog (4 plans, including retroactive final verification) — complete
- [x] Phase 3: Sales Recording (1 retroactive verification plan) — complete
- [x] Phase 4: Expense Log (1 retroactive verification plan) — complete
- [x] Phase 5: Subscriptions & Recurring Logic (1 retroactive verification plan) — complete
- [x] Phase 6: Visual Aesthetics & Dashboard (1 retroactive verification plan) — complete
- [x] Phase 7: Notifications (1 retroactive verification plan) — complete
- [x] Phase 8: Local Settings (1 retroactive verification plan) — complete
- [x] Phase 9: Release Safety and Data Correctness (1 plan) — complete
- [x] Phase 10: Complete Remaining v1 Workflows (3 plans) — complete

The original backend Hono/PostgreSQL plans remain historical context only. The
offline IndexedDB implementation and its verification records are authoritative
for the shipped product.

</details>

## Current status

- v1 requirements: 39/39 complete.
- Automated verification: 23 tests passed, strict TypeScript passed, Vite
  production build passed, and `git diff --check` passed.
- No remote backend or external publishing is part of v1.

## Backlog for the next milestone

- Email verification after signup.
- Password reset by email link.
- Optional TOTP two-factor authentication.
- Multi-currency sales, receipt images, recurring income schedules, and custom
  date-range reports.
- Scheduled email reports, revenue milestones, weekly summaries, and AI
  categorization/forecasting/anomaly detection.

---
*Last updated: 2026-08-12 after v1.0 completion*
