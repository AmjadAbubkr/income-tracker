---
title: Structure
last_updated: 2026-05-17
scope: full-repo
---

# STRUCTURE.md — Directory Structure

## Overview

```
income-tracker/
├── node_modules/          # Dependencies (package.json missing from root)
├── src/
│   ├── main.tsx           # Vite entry point
│   ├── App.tsx            # Root component + all state management
│   ├── App.css            # Main stylesheet (55KB)
│   ├── mobile.css         # Responsive/mobile styles (11KB)
│   ├── types.ts           # TypeScript interfaces
│   ├── vite-env.d.ts      # Vite type declarations
│   ├── components/        # UI components
│   │   ├── auth/          # Authentication pages
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── AnalyticsCharts.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── BusinessSubscriptionForm.tsx
│   │   ├── CustomerSubscriptionForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── Header.tsx
│   │   ├── IncomeEntryForm.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── SalesPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SubscriptionsPage.tsx
│   │   └── SummaryCard.tsx
│   ├── context/           # React context providers
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx   # i18n translations (720 lines)
│   │   ├── NotificationContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   └── useCurrentDate.ts
│   └── utils/             # Utility modules
│       ├── backup.ts      # JSON backup/restore
│       ├── currency.ts    # Currency formatting
│       ├── dailyStats.ts  # Daily sales tracking
│       ├── database.ts    # IndexedDB wrapper (317 lines)
│       ├── dateUtils.ts   # Date calculations
│       ├── export.ts      # Excel export via xlsx
│       └── storage.ts     # Storage facade
└── stitch_designs/        # Design reference files (empty or images)
```

## Key Locations

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Central hub — all state, all handlers, all view routing |
| `src/types.ts` | All TypeScript interfaces (User, Product, IncomeEntry, Expense, Subscriptions) |
| `src/utils/database.ts` | IndexedDB schema and all CRUD operations |
| `src/utils/storage.ts` | Storage facade layer |
| `src/context/LanguageContext.tsx` | Translations for EN/FR/AR (largest file at 720 lines) |
| `src/utils/export.ts` | Excel export with multi-sheet workbooks |
| `src/components/SubscriptionsPage.tsx` | Largest component (19KB) — handles both business and customer subscriptions |

## Naming Conventions

- **Components**: PascalCase, suffixed with `Page` for route-level views, `Form` for input components
- **Context files**: `*Context.tsx` pattern
- **Utilities**: camelCase, descriptive names (`dateUtils.ts`, `dailyStats.ts`)
- **Types**: PascalCase interfaces in single `types.ts` file
- **CSS files**: Co-located with usage (`App.css`, `mobile.css`)

## File Size Distribution

| Size Range | Files | Notes |
|------------|-------|-------|
| >15KB | `App.css` (55KB), `App.tsx` (16KB), `SubscriptionsPage.tsx` (19KB), `LanguageContext.tsx` (37KB) | Largest files |
| 10-15KB | `mobile.css` (11KB), `database.ts` (12KB), `SalesPage.tsx` (12KB) | Medium-large |
| 5-10KB | Most page components and forms | Typical component size |
| <5KB | Utilities, contexts, types, hooks | Small modules |

## Notable Absences

- No `package.json` at root (may have been deleted or project was scaffolded differently)
- No `tsconfig.json` visible
- No `vite.config.ts` visible
- No test files
- No CI/CD configuration
- No `.gitignore`
