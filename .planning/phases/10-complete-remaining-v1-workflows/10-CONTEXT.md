# Phase 10: Complete Remaining v1 Workflows - Context

**Gathered:** 2026-08-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the deferred v1 user workflows in the offline IncomeTrack app: sales
and expense history with editing and filtering, dashboard and reporting
completion, in-app notifications, editable profile details, and visible
English/French/Arabic coverage. Preserve the existing local-only IndexedDB
architecture, user isolation, integer minor-unit financial storage, and simple
existing visual patterns.

</domain>

<decisions>
## Implementation Decisions

### Record history and editing
- **D-01:** Reuse the existing sales and expense forms/modal patterns for editing
  instead of introducing a second editing interaction.
- **D-02:** Keep history local and list-based. Sales support date and product
  filtering; expenses support date and category filtering.
- **D-03:** Preserve atomic and ownership-safe IndexedDB operations when adding
  individual record updates and deletes. Do not reintroduce bulk replacement for
  single-record edits.

### Dashboard, analytics, and reports
- **D-04:** Dashboard and analytics calculations must use the selected period
  consistently for revenue, expenses, net profit, charts, top products, recent
  activity, and exports.
- **D-05:** Excel exports remain client-side and use the existing `xlsx`
  dependency. Daily/monthly exports include the correctly filtered income and
  expense data and a period summary.
- **D-06:** PDF reporting uses a print-ready browser report flow with print CSS
  and no new PDF dependency. The report must be usable through the browser's
  Save as PDF action and remain offline.

### Notifications and profile
- **D-07:** Notifications remain in-app only, using the existing notification
  provider and dropdown. Low stock means stock at or below 5; subscription
  reminders cover billing dates within the next 3 days.
- **D-08:** Notification copy and profile/settings copy are translated through
  the existing EN/FR/AR language system, with Arabic RTL behavior preserved.
- **D-09:** Profile email is editable and must be validated against existing
  local accounts before saving; name and email changes remain scoped to the
  authenticated local user.

### Localization scope
- **D-10:** Complete the visible user-facing copy encountered in the Phase 10
  workflows and the shared shell (header, navigation, empty states, actions,
  confirmations, errors, reports, and notifications) in EN/FR/AR. Reuse
  existing translation keys where possible and add focused keys only when
  necessary.

### the agent's Discretion
- Choose the smallest implementation that fits the existing component and
  storage patterns for filters, table/list layout, print markup, and tests.
- Use the existing design tokens and controls; no visual redesign is required.
- Keep two-factor authentication and other v2 settings outside this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product scope and requirements
- `.planning/ROADMAP.md` — Phase 10 boundary and remediation milestone.
- `.planning/REQUIREMENTS.md` — SALE-02/03/04, EXP-02/04, DASH-01..05,
  NOTF-01/02, SET-04, and RPT-01/02/05/06 acceptance requirements.
- `.planning/PROJECT.md` — offline architecture, local privacy boundary, and
  product scope.
- `.planning/STATE.md` — deferred items and current phase status.

### Prior remediation decisions
- `.planning/phases/09-release-safety-and-data-correctness/09-01-SUMMARY.md` —
  exact money storage, ownership checks, atomic IndexedDB transactions, and
  verification baseline that Phase 10 must preserve.

### Codebase conventions and architecture
- `.planning/codebase/ARCHITECTURE.md` — component/provider/storage layering and
  navigation integration points.
- `.planning/codebase/CONVENTIONS.md` — existing TypeScript and UI conventions.
- `.planning/codebase/STACK.md` — current React/Vite/Zustand/TanStack/Vitest
  stack and available client-side dependencies.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/utils/database.ts` and `src/utils/storage.ts` — user-scoped IndexedDB
  facade and transaction helpers; extend these for individual record updates.
- `src/stores/incomeStore.ts` and `src/stores/expenseStore.ts` — existing
  loading and mutation patterns for list screens.
- `src/components/ExpenseForm.tsx` and the sales cart controls — existing form
  and validation patterns to reuse for edit flows.
- `src/utils/currency.ts`, `src/utils/dateUtils.ts`, and
  `src/utils/export.ts` — exact minor-unit formatting, date boundaries, and
  client-side export primitives.
- `src/context/LanguageContext.tsx` and `src/translations.ts` — existing EN,
  FR, and AR translation mechanism with RTL support.
- `src/context/NotificationContext.tsx` and `src/components/Header.tsx` —
  existing in-app notification calculation and dropdown surface.

### Established Patterns
- Financial values are stored as integer minor units and formatted only at
  display/export boundaries.
- All user-owned records must be scoped by the current local user and checked
  again at mutation boundaries.
- The app uses component-state view switching, Zustand stores for financial
  records, and TanStack Query invalidation for affected screens.
- Tests use Vitest with jsdom and fake-indexeddb; source changes require the
  existing typecheck, tests, build, and diff checks.

### Integration Points
- `src/components/SalesPage.tsx`, `ExpensesPage.tsx`, `Dashboard.tsx`, and
  `AnalyticsPage.tsx` are the primary workflow surfaces.
- `src/App.tsx` owns view composition and store loading; shared providers wrap
  the authenticated application shell.
- `src/context/AuthContext.tsx` owns profile persistence and must remain the
  only profile update boundary.
- `src/App.css` already contains styling for list/filter/profile/report-like
  surfaces; reuse it or add narrowly scoped styles.

</code_context>

<specifics>
## Specific Ideas

- Keep the UX simple and practical: existing forms, local lists, and focused
  filters are preferred over new navigation or complex table infrastructure.
- The PDF result should be a clean printable financial summary rather than a
  new document-generation subsystem.
- Phase 10 is the final remediation phase; verification must cover the full
  deferred workflow set, not just compile-time success.

</specifics>

<deferred>
## Deferred Ideas

- Two-factor authentication changes remain outside this phase because they are
  v2 scope and are not needed to complete profile name/email editing.
- Cloud sync, server persistence, browser push notifications, and cross-device
  collaboration remain out of scope for the offline product.

</deferred>

---

*Phase: 10-complete-remaining-v1-workflows*
*Context gathered: 2026-08-12*
