---
title: Architecture
last_updated: 2026-05-17
scope: full-repo
---

# ARCHITECTURE.md — System Architecture

## Pattern

**Single-Page Application (SPA)** with client-side routing via component state. No external router library.

- All navigation managed through `currentView` state in `App.tsx` (type `View = 'dashboard' | 'sales' | 'products' | 'analytics' | 'settings' | 'expenses' | 'subscriptions'`)
- Auth state managed through `user` state from `AuthContext`
- Conditional rendering: if no user, shows `LoginPage` or `RegisterPage`; otherwise shows main app layout

## Layers

```
┌─────────────────────────────────────────┐
│           UI Components (JSX)            │
│  Dashboard, SalesPage, ProductsPage,     │
│  AnalyticsPage, ExpensesPage,            │
│  SubscriptionsPage, SettingsPage,        │
│  Header, Sidebar, Forms                  │
├─────────────────────────────────────────┤
│         React Context Providers          │
│  ThemeProvider → LanguageProvider →      │
│  AuthProvider → NotificationProvider     │
├─────────────────────────────────────────┤
│           React Hooks & State            │
│  useState, useEffect, useCurrentDate     │
├─────────────────────────────────────────┤
│          Storage Abstraction Layer       │
│  storage.ts (facade) → database.ts       │
│  (IndexedDB wrapper)                     │
├─────────────────────────────────────────┤
│          Utility Modules                 │
│  currency.ts, dateUtils.ts,              │
│  dailyStats.ts, backup.ts, export.ts     │
├─────────────────────────────────────────┤
│          Browser APIs                    │
│  IndexedDB, localStorage, crypto, Blob   │
└─────────────────────────────────────────┘
```

## Data Flow

1. **User Action** → Component event handler (e.g., `handleAddProduct` in `App.tsx`)
2. **State Update** → `setProducts(updatedProducts)` (React state)
3. **Persistence** → `await storage.saveProducts(updatedProducts)` (IndexedDB write)
4. **Re-render** → React re-renders affected components with new state

**Read path**: On user login, `App.tsx` calls `Promise.all([storage.getProducts(), ...])` to load all data from IndexedDB into React state.

## Abstractions

### Storage Facade
- `src/utils/storage.ts` — Thin facade that delegates all operations to `database.ts`
- Provides a clean API: `getProducts()`, `saveProducts()`, `addProduct()`, `deleteProduct()`, etc.
- Auth operations nested under `storage.auth`

### Database Class
- `src/utils/database.ts` — Singleton `Database` class wrapping IndexedDB
- Manages `currentUserId` for multi-user data isolation
- Generic helpers: `getAllForUser<T>()`, `saveAllForUser<T>()`, `addOneForUser<T>()`
- Auto-initializes on module import: `database.init().catch(console.error)`

### Context Providers
- **ThemeContext** — Dark/light theme toggle, persisted to localStorage
- **LanguageContext** — i18n with 3 languages (EN, FR, AR), RTL support for Arabic
- **AuthContext** — User login/register/logout, session restore from localStorage
- **NotificationContext** — Dynamic alerts for low stock and upcoming subscriptions

## Entry Points

- **`src/main.tsx`** — Vite entry point, renders `<Root />` into `#root`
- **`src/App.tsx`** → `export default function Root()` — Wraps app in all context providers, renders `App` component

## Key Architectural Decisions

1. **All state in `App.tsx`**: The root component owns all data state (products, income, expenses, subscriptions). Child components receive data and callbacks as props.
2. **No server**: Fully offline-capable. All data stored in browser IndexedDB.
3. **Bulk-save pattern**: `saveAllForUser` deletes all existing records for a user and re-adds the full array. Simple but inefficient for large datasets.
4. **Auto-subscription processing**: `App.tsx` has a `useEffect` that processes recurring subscriptions on day change, auto-creating expense/income entries.
