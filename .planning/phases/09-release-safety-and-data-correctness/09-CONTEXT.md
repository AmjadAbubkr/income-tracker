# Phase 9: Release Safety and Data Correctness - Context

**Gathered:** 2026-08-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the existing offline IncomeTrack application safe to release: restore a
strict TypeScript baseline, prevent ordinary cross-profile data exposure, store
money exactly, and make checkout, recurring subscriptions, and backup restore
durable and atomic. Establish regression coverage for these paths.

</domain>

<decisions>
## Implementation Decisions

### Exact money representation
- **D-01:** Persist money as integer minor units, never JavaScript floating
  point. Convert decimal form input at the boundary and format only for display
  or export.
- **D-02:** Keep the configured currency with the profile and use its ISO
  minor-unit scale when converting existing records and new input. A migration
  must preserve existing IndexedDB records and versioned backups.

### Local profiles and session boundary
- **D-03:** Keep the approved offline-only architecture. Local authentication
  is a privacy boundary for normal shared-device use, not protection against a
  person with browser developer-tools access to the same browser profile.
- **D-04:** Replace a bare persisted user ID with a random local session record
  and token, clear all in-memory/query caches on account changes, and enforce
  record ownership inside storage mutations. The normal refresh session remains
  supported.

### Financial write integrity
- **D-05:** Centralize checkout and subscription processing in IndexedDB
  multi-store transactions. A write must either commit ledger entries, stock,
  and subscription dates together or leave them unchanged.
- **D-06:** Subscription processing must be idempotent and catch up overdue
  dates without duplicate ledger entries.
- **D-07:** Backup data is fully validated before writes, then restored in one
  transaction. Invalid input must leave existing data untouched.

### Verification baseline
- **D-08:** Add a non-watch `test` command, a strict `typecheck` command, and
  focused Vitest coverage using a browser IndexedDB test environment. Start
  with money conversion, account switching, checkout, subscription processing,
  and backup restore.

### the agent's Discretion
- Choose small, established browser-compatible libraries only when they reduce
  correctness risk more than they expand the dependency surface.
- Keep the existing React, Zustand, TanStack Query, and plain-CSS conventions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and phase scope
- `.planning/PROJECT.md` - Authoritative offline-only architecture and local
  profile model.
- `.planning/ROADMAP.md` - Phase 9 boundary and Phase 10 deferral.
- `.planning/REQUIREMENTS.md` - v1 behavior that financial changes must retain.

### Existing implementation
- `src/utils/database.ts` - IndexedDB schema, user scoping, and persistence
  boundary.
- `src/utils/storage.ts` - Storage facade consumed by app state.
- `src/context/AuthContext.tsx` - Local account and session behavior.
- `src/stores/incomeStore.ts` - Income write path.
- `src/stores/expenseStore.ts` - Expense write path.
- `src/stores/subscriptionStore.ts` - Recurring billing behavior.
- `src/utils/backup.ts` - Backup and restore behavior.
- `src/utils/currency.ts` - Currency configuration and display formatting.
- `src/types.ts` - Persisted financial record shapes.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/utils/database.ts`: existing IndexedDB singleton and per-user indexes.
- `src/utils/storage.ts`: stable facade where transaction-backed operations can
  be introduced without spreading IndexedDB details through UI components.
- `src/stores/*Store.ts`: Zustand state owners for income, expenses, and
  subscriptions.
- `src/utils/currency.ts`: current display formatting boundary.

### Established Patterns
- React providers own authentication, language, theme, and notifications.
- TanStack Query owns product/category queries; Zustand owns financial lists.
- The app uses ISO date-only strings for financial records.

### Integration Points
- `src/App.tsx` hydrates stores and triggers recurring subscription processing.
- `src/components/SalesPage.tsx` and `src/components/IncomeEntryForm.tsx`
  initiate sale writes.
- `src/components/SettingsPage.tsx` initiates backup import/export.

</code_context>

<specifics>
## Specific Ideas

No visual redesign is part of this phase. The aim is correct, durable behavior
behind the existing UI.

</specifics>

<deferred>
## Deferred Ideas

- Sales and expense history/editing/filtering, dashboard/report completion,
  notifications, profile email editing, PDF export, and translation completion
  belong to Phase 10.
- Strong protection against a person with unrestricted developer-tools access
  requires encrypting profile data and an explicit unlock flow; that is outside
  this remediation scope.

</deferred>

---

*Phase: 9-Release Safety and Data Correctness*
*Context gathered: 2026-08-12*
