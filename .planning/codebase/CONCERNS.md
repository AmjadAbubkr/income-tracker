---
title: Concerns
last_updated: 2026-05-17
scope: full-repo
---

# CONCERNS.md — Technical Debt & Issues

## Security Issues

### HIGH — Passwords Stored in Plaintext
- **File**: `src/types.ts:7` — `password?: string` with comment "Storing simply here for local demo"
- **File**: `src/utils/database.ts` — passwords stored directly in IndexedDB `users` store
- **Risk**: Anyone with browser access can read all user passwords from DevTools
- **Fix**: Hash passwords (bcrypt/argon2) or remove password auth entirely for local-only app

### MEDIUM — No Input Sanitization
- **File**: `src/utils/backup.ts` — `JSON.parse(content)` without schema validation
- **Risk**: Malicious backup files could inject unexpected data
- **Fix**: Add JSON schema validation or use a library like Zod

### LOW — localStorage Session Token
- **File**: `src/context/AuthContext.tsx:52` — `localStorage.setItem('user_email_session', email)`
- **Risk**: Session hijacking via XSS (email used as session identifier)
- **Fix**: Use a proper session token instead of email address

## Performance Issues

### HIGH — Bulk-Save Pattern
- **File**: `src/utils/database.ts:178-207` — `saveAllForUser()` deletes ALL records for a user and re-adds them
- **Impact**: O(n) write for every single change. Degrades rapidly as data grows
- **Example**: Adding one product re-writes all products
- **Fix**: Implement individual add/update/delete operations instead of bulk replace

### MEDIUM — All State in App.tsx
- **File**: `src/App.tsx` — 419 lines, manages 5 data arrays, 7 views, search, sidebar state
- **Impact**: Every state change re-renders the entire component tree
- **Fix**: Move data state to a context or use `useReducer` for better scoping

### MEDIUM — No Memoization
- **No `useMemo` or `useCallback`** used anywhere
- **Impact**: Unnecessary re-renders on every parent state change
- **Fix**: Memoize expensive computations (filtered products, analytics calculations)

### LOW — Notification Polling
- **File**: `src/context/NotificationContext.tsx` — regenerates notifications on every mount/user change
- **Impact**: Reads from 3 IndexedDB stores on every notification refresh
- **Fix**: Cache notification state, only refresh on data changes

## Code Quality Issues

### HIGH — No Tests
- **Zero test coverage** across the entire codebase
- **Risk**: Regressions go undetected, refactoring is risky
- **See**: `TESTING.md` for recommended strategy

### MEDIUM — Missing Configuration Files
- **No `package.json`** at project root
- **No `tsconfig.json`** visible
- **No `vite.config.ts`** visible
- **Impact**: Cannot install dependencies, run scripts, or verify build configuration
- **Risk**: Project may not be reproducible on another machine

### MEDIUM — Large Monolithic Files
- `LanguageContext.tsx`: 720 lines (mostly translation strings)
- `App.css`: 55KB (all styles in one file)
- `SubscriptionsPage.tsx`: 19KB
- **Fix**: Split translations into separate JSON files, modularize CSS

### MEDIUM — Mixed Language in Code
- **File**: `src/context/LanguageContext.tsx:101` — `inStock: 'En stock'` (French value in English translations)
- **Impact**: Incorrect UI text for English users
- **Fix**: Review all translation keys for language accuracy

### LOW — `@ts-ignore` Usage
- **File**: `src/utils/database.ts:168` — `// @ts-ignore` in `getAllForUser` fallback
- **Risk**: Type safety bypassed, potential runtime errors
- **Fix**: Properly type the fallback path

## Architecture Concerns

### MEDIUM — No Routing Library
- Navigation via component state in `App.tsx`
- **Impact**: No browser history, no back/forward navigation, no deep linking
- **Fix**: Add `react-router` or a lightweight router for proper URL-based navigation

### MEDIUM — Tightly Coupled State
- `App.tsx` handlers mutate multiple state arrays simultaneously (e.g., `handleAddIncome` updates income entries AND product inventory)
- **Impact**: Complex state interactions, hard to reason about
- **Fix**: Separate concerns, use event-driven updates

### LOW — Auto-Subscription Processing on Render
- **File**: `src/App.tsx:89-178` — subscription processing runs in `useEffect` dependent on `businessSubscriptions.length > 0`
- **Impact**: Boolean dependency causes effect to re-run when length changes from 0 to 1 or vice versa
- **Fix**: Use a more stable dependency or explicit trigger

## Data Integrity Concerns

### MEDIUM — No Unique ID Validation
- `saveAllForUser` deletes by `userId` index keys, then re-adds
- **Risk**: If two saves overlap, data could be lost
- **Fix**: Use transactions properly or implement optimistic locking

### LOW — Date String Comparison
- Dates compared as strings: `currentSub.nextBillingDate <= today`
- **Works** for ISO format but fragile if format changes
- **Fix**: Use `Date` objects for comparison or document the ISO string contract

## Missing Features

- **No offline indicator** — app is fully offline but user doesn't know
- **No data sync** — no way to sync between devices (by design, but worth noting)
- **No pagination** — all records loaded at once, will slow with large datasets
- **No search indexing** — search filters in-memory on every render
- **No image optimization** — product images stored as base64 (bloats IndexedDB)
