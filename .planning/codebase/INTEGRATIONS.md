---
title: Integrations
last_updated: 2026-05-17
scope: full-repo
---

# INTEGRATIONS.md — External Integrations

## Database

### IndexedDB (Browser-Native)

- **File**: `src/utils/database.ts`
- **Database name**: `IncomeTrackerDB` (version 4)
- **Object stores**:
  - `users` — User accounts, keyed by `id`, indexed by `email` (unique)
  - `products` — Product catalog, keyed by `id`, indexed by `name`, `createdAt`, `userId`
  - `income` — Income/sales entries, keyed by `id`, indexed by `productId`, `date`, `amount`, `userId`
  - `expenses` — Expense records, keyed by `id`, indexed by `category`, `date`, `userId`
  - `business_subscriptions` — Business tool subscriptions, keyed by `id`, indexed by `status`, `nextBillingDate`, `userId`
  - `customer_subscriptions` — Customer recurring subscriptions, keyed by `id`, indexed by `status`, `customerName`, `nextBillingDate`, `userId`

- **Multi-user support**: All stores (except `users`) have a `userId` index for data isolation. The `Database` class maintains a `currentUserId` that scopes all CRUD operations.

### localStorage

- **Keys used**:
  - `user_email_session` — Persisted login email for session restore
  - `theme` — Current theme preference (`dark` | `light`)
  - `language` — Current language preference (`en` | `fr` | `ar`)

## External APIs

**None.** This is a fully offline, client-side application. No HTTP API calls, no backend server, no third-party service integrations.

## Auth

- **Type**: Local-only authentication stored in IndexedDB
- **Implementation**: `src/context/AuthContext.tsx` + `src/utils/database.ts`
- **Mechanism**: Email-based login with optional password field (stored plaintext in IndexedDB — see CONCERNS.md)
- **Session**: Email persisted in `localStorage` for session restore on page reload
- **No external auth provider**: No OAuth, JWT, or third-party identity service

## File I/O

### Backup/Restore
- **File**: `src/utils/backup.ts`
- **Export**: Downloads JSON backup file via `Blob` + `URL.createObjectURL`
- **Import**: Reads uploaded JSON file via `FileReader`, validates schema, writes to IndexedDB

### Excel Export
- **File**: `src/utils/export.ts`
- **Library**: `xlsx` (SheetJS)
- **Output**: Multi-sheet `.xlsx` files with Summary, Sales Data, Product Performance, and optional Daily Breakdown sheets
- **Trigger**: Manual user action from Dashboard

## Webhooks

**None.**

## Third-Party Services

**None.**
