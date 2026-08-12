# IncomeTrack — Business Income & Sales Tracker

## What This Is

IncomeTrack is a modern web-based business sales, income, and expense tracker.
It runs entirely in the browser and stores accounts, inventory, sales,
expenses, subscriptions, settings, and backups locally in IndexedDB.

## Core Value

A business owner can sign in locally, manage products and inventory, record
sales and expenses, and understand business performance immediately while
keeping financial data on the device.

## Requirements

### Validated in v1.0

- ✓ AUTH-01 through AUTH-04 — local account creation, sign-in, session restore,
  and logout.
- ✓ PROD-01 through PROD-05 — product/category CRUD and optional inventory.
- ✓ SALE-01 through SALE-05 — single and batch sales, history management, and
  filtering.
- ✓ EXP-01 through EXP-04 — categorized expense entry, history management, and
  filtering.
- ✓ SUB-01 through SUB-04 — business/customer subscriptions and automatic
  recurring ledger entries.
- ✓ DASH-01 through DASH-05 — period summaries, charts, top products, and
  recent activity.
- ✓ NOTF-01 through NOTF-02 — low-stock and near-term billing notifications.
- ✓ SET-01 through SET-04 — currency, theme, EN/FR/AR language, RTL, and
  profile editing.
- ✓ RPT-01 through RPT-06 — period-aware Excel export, JSON backup/restore,
  summary reporting, and browser PDF printing.

### Active for the next milestone

- Email verification and password reset.
- Optional TOTP two-factor authentication.
- Multi-currency sales, receipt images, recurring income schedules, and
  custom date-range reports.
- Scheduled email reports, revenue milestones, weekly summaries, and AI
  categorization/forecasting/anomaly detection.

## Out of Scope (By Design)

- Server-side database sync — v1 is intentionally local-only.
- OAuth/social sign-in — email/password is sufficient for v1.
- Cross-device sync — users can move data with JSON backups.
- Full double-entry accounting, payroll, CRM, warehouse management, bank
  feeds, team collaboration, and invoice generation.
- Native mobile app — responsive web covers v1 mobile use cases.

## Architecture Context

- **Frontend:** React 19, Vite, TypeScript strict mode, Zustand, TanStack
  Query, and Recharts.
- **Database:** IndexedDB in `src/utils/database.ts` for users, products,
  categories, sales, expenses, and recurring subscriptions.
- **Money:** Integer minor units are persisted and decimal input is parsed and
  formatted through `src/utils/currency.ts`.
- **Privacy:** Local sessions and transaction-level `userId` checks isolate
  records when users share a browser profile.
- **Reliability:** Checkout, subscription catch-up, and backup restore use
  atomic IndexedDB transactions with pre-validation where required.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 100% local offline app | Financial data should not leave the user's device in v1. | Applied in v1.0 |
| IndexedDB as the source of truth | It provides durable structured browser storage beyond localStorage limits. | Applied in v1.0 |
| Local account/session boundary | Multiple users can safely share one browser profile. | Applied in v1.0 |
| Integer minor-unit money | Prevent floating-point rounding errors in financial records. | Applied in v1.0 |
| Atomic financial mutations | Checkout, recurring billing, and restore must not leave partial state. | Applied in v1.0 |
| Browser print for PDF | Keeps the v1 report flow offline and dependency-light. | Applied in v1.0 |

## Current State

v1.0 shipped on 2026-08-12. The final verification suite passed 23 tests across
8 files, strict TypeScript passed, and the production Vite build passed. The
build still reports the known large bundle and mixed storage import warnings;
these are non-blocking follow-up work.

## Next Milestone Goals

Start the next milestone with `$gsd-new-milestone` to define and prioritize the
active v2 requirements before implementation.

---
*Last updated: 2026-08-12 after v1.0 milestone completion*
