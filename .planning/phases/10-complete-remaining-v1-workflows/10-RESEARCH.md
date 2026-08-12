# Phase 10 Research: Complete Remaining v1 Workflows

**Researched:** 2026-08-12
**Method:** Existing repository and planning artifacts; no external service or
  dependency research is required for this offline-only phase.

## Findings

### 1. Storage and state seams

- `src/utils/database.ts` already provides user-scoped IndexedDB reads and
  ownership-checked mutations for the Phase 9 safety boundary. Phase 10 should
  add individual income/expense update operations beside the existing delete
  operations, preserving the current-user checks in the same transaction.
- `src/utils/storage.ts` is the intended thin facade for those operations.
- `src/stores/incomeStore.ts` and `src/stores/expenseStore.ts` currently support
  fetch/add/delete but not individual update. Adding update methods keeps the
  screens from bypassing persistence.
- `IncomeEntry` and `Expense` already use integer `amountMinor`; filters and
  reports must compare ISO date strings and calculate in minor units.

### 2. Sales and expense UI gaps

- `src/components/SalesPage.tsx` is currently centered on product selection and
  batch checkout. It has no transaction history surface, record edit flow, or
  individual delete flow.
- `src/components/ExpensesPage.tsx` lists expenses and supports add/delete. The
  existing `ExpenseForm` already accepts edit-oriented initial data, so the
  smallest change is to wire a selected expense into that form and add date and
  category filters.
- Existing CSS contains list/filter styles that can be reused. No new route or
  navigation view is needed.

### 3. Dashboard and analytics gaps

- `Dashboard.tsx` has summary cards and a chart, but its period calculations are
  not a complete daily/monthly/all-time contract, the chart does not consistently
  include expenses, and there is no recent activity feed.
- `AnalyticsPage.tsx` filters income but calculates expenses from the complete
  expense collection and exports an empty expense list. `AnalyticsCharts.tsx`
  receives income-focused data and needs a narrow contract extension for the
  selected expense/period data.
- `src/utils/export.ts` exports sales-only workbooks. It should accept the
  already-filtered period data and add a summary/expense sheet without changing
  the exact minor-unit boundary.
- No PDF library is installed. A print report component/window with print CSS
  satisfies the offline PDF requirement without increasing bundle or storage
  complexity.

### 4. Notifications, profile, and translations

- `NotificationContext.tsx` already computes low-stock alerts at `<= 5` and
  subscriptions whose next billing date is within three days. Its behavior is
  therefore a localization/refresh integration task, not a new notification
  backend.
- `Header.tsx` owns the notification dropdown and several shared-shell strings
  are still hardcoded. These strings should use the existing language context
  and keep the current dropdown behavior.
- `SettingsPage.tsx` shows email as disabled and does not pass email to
  `AuthContext.updateProfile`. The authenticated profile update boundary can be
  extended with local duplicate-email validation.
- `translations.ts` already contains the three-language dictionary. Because its
  translation key type is permissive, tests should assert rendered copy on the
  Phase 10 surfaces rather than relying on compile-time missing-key detection.

## Recommended implementation order

1. Add storage/store update APIs and screen-level sales/expense history flows.
2. Build one shared period/filter calculation contract for dashboard, analytics,
   Excel, and print reporting.
3. Localize and refresh notifications, wire editable profile email, then audit
   the shared shell and changed workflow surfaces for EN/FR/AR.
4. Run contract tests plus typecheck, full Vitest, production build, and
   `git diff --check` after each atomic task group.

## Constraints to preserve

- Do not persist floating-point monetary values; all new calculations remain
  integer minor-unit calculations.
- Do not use bulk replacement for individual record edits.
- Do not widen the app beyond local IndexedDB, in-app notifications, and the
  requirements listed in `10-CONTEXT.md`.
- Do not add a PDF dependency for this phase.

## Research conclusion

The phase is implementable with the current stack and existing components. The
work should be split into three plans: sales/expense workflows, dashboard and
reporting, and notifications/profile/localization. The second plan depends on
the first because its period calculations consume the finalized record-edit
and-filter data contracts; the third depends on shared shell changes but can
use the completed stores and translation keys.

## RESEARCH COMPLETE
