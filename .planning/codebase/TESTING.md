---
title: Testing
last_updated: 2026-05-17
scope: full-repo
---

# TESTING.md — Testing Strategy

## Current State

**No tests exist in this codebase.**

- No test files found (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`)
- No test framework configured (no Jest, Vitest, Playwright, Cypress config files)
- No test scripts in any visible configuration
- No `__tests__` directories
- No mocking utilities

## Testing Gaps

### Critical Untested Areas

1. **Database Layer** (`src/utils/database.ts`)
   - IndexedDB CRUD operations
   - Multi-user data isolation
   - Schema migrations (`onupgradeneeded`)
   - Error handling for failed transactions

2. **Auth Flow** (`src/context/AuthContext.tsx`)
   - Login/register/logout logic
   - Session restore from localStorage
   - User validation

3. **Business Logic** (`src/App.tsx`)
   - Auto-subscription processing (recurring billing logic)
   - Inventory deduction on sale
   - Daily stats reset logic
   - Currency change handling

4. **Utilities**
   - `dateUtils.ts` — billing date calculations
   - `currency.ts` — currency formatting
   - `dailyStats.ts` — daily sales tracking
   - `backup.ts` — import/export validation
   - `export.ts` — Excel generation

5. **Components**
   - Form validation
   - User interactions
   - State changes

## Recommended Test Strategy

### Unit Tests (Priority: High)

**Framework**: Vitest (matches Vite setup)

**What to test first**:
1. `dateUtils.ts` — `calculateNextBillingDate()` with monthly/yearly inputs
2. `currency.ts` — `formatCurrency()` with different currencies
3. `database.ts` — CRUD operations with IndexedDB mock
4. `dailyStats.ts` — reset logic, add sale logic

### Integration Tests (Priority: Medium)

**Framework**: Testing Library + jsdom

**What to test**:
1. Auth flow: login → data load → logout
2. Product CRUD: add → edit → delete → verify in storage
3. Subscription auto-processing: day change → new entries created

### E2E Tests (Priority: Low)

**Framework**: Playwright

**What to test**:
1. Full user journey: register → add product → record sale → view dashboard
2. Backup/restore cycle
3. Excel export

## Mocking Strategy

- **IndexedDB**: Use `fake-indexeddb` for database tests
- **localStorage**: Jest/Vitest built-in mock or manual mock
- **crypto.randomUUID()**: Mock to return predictable IDs
- **xlsx**: Mock for export tests
- **Date**: Use `vi.setSystemTime()` (Vitest) for time-dependent tests

## Coverage Targets

Given the current state (0% coverage), realistic initial targets:
- **Phase 1**: 40% — utilities and database layer
- **Phase 2**: 60% — add context and component tests
- **Phase 3**: 80% — full coverage excluding CSS and trivial components
