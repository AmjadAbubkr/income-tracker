---
title: Conventions
last_updated: 2026-05-17
scope: full-repo
---

# CONVENTIONS.md — Code Style & Patterns

## Code Style

### TypeScript

- **Interfaces** for all data models (`User`, `Product`, `IncomeEntry`, `Expense`, `BusinessSubscription`, `CustomerSubscription`)
- **Type aliases** for view states: `type View = 'dashboard' | 'sales' | ...`
- **Optional properties** used for nullable fields: `firstName?: string`, `notes?: string`
- **Union types** for enums: `billingCycle: 'monthly' | 'yearly'`, `status: 'active' | 'paused' | 'cancelled'`
- **Generics** used in database helpers: `getAllForUser<T>()`, `saveAllForUser<T extends { id: string, userId?: string }>()`

### Naming

| Convention | Example |
|------------|---------|
| Components | PascalCase: `Dashboard`, `ProductForm`, `LoginPage` |
| Hooks | camelCase with `use` prefix: `useCurrentDate`, `useAuth`, `useLanguage` |
| Contexts | `*Context` + `*Provider`: `AuthContext` / `AuthProvider` |
| Utilities | camelCase files: `dateUtils.ts`, `dailyStats.ts` |
| Event handlers | `handle*` prefix: `handleAddProduct`, `handleDeleteExpense` |
| State setters | `set*` prefix: `setProducts`, `setCurrentView` |
| CSS classes | kebab-case: `app-main`, `main-content`, `loading-spinner` |

## React Patterns

### Context Pattern

All contexts follow the same structure:
```tsx
const XContext = createContext<XContextType | undefined>(undefined);

export function XProvider({ children }: { children: ReactNode }) { ... }

export function useX() {
    const context = useContext(XContext);
    if (context === undefined) {
        throw new Error('useX must be used within a XProvider');
    }
    return context;
}
```

### State Management

- **Lifted state**: All data state lives in `App.tsx`, passed down as props
- **No useMemo/useCallback**: No memoization optimizations
- **Effect-heavy**: Multiple `useEffect` hooks in `App.tsx` for data loading, subscription processing, daily stats reset

### Component Structure

- Page components are functional components accepting props interfaces
- Form components are self-contained modals/dialogs with internal state
- No custom hooks beyond `useCurrentDate` (wraps `new Date()` for reactive today date)

## Error Handling

### Patterns

- **Try/catch** around async IndexedDB operations
- **Console.error** for error logging: `console.error("Login error", error)`
- **User-facing errors** via `alert()` for export failures and validation messages
- **Promise rejection** propagation: `request.onerror = () => reject(request.error)`

### Validation

- **Form validation** in component handlers with alert messages
- **Backup validation** in `backup.ts`: checks for required fields in JSON structure
- **No schema validation library** — manual `if` checks

## CSS Conventions

- **Plain CSS** — no preprocessor, no CSS modules, no Tailwind
- **CSS custom properties** used for theming: `var(--bg)`, `var(--text)`, etc.
- **Two stylesheets**: `App.css` (desktop/main) and `mobile.css` (responsive)
- **Theme attribute**: `data-theme` attribute on `<html>` for dark/light mode
- **Large CSS files**: `App.css` is 55KB — suggests many component styles in one file

## Date Handling

- **ISO strings** for all date storage: `new Date().toISOString()`
- **Date comparison** via string comparison: `currentSub.nextBillingDate <= today`
- **Date formatting** in `dateUtils.ts`: `calculateNextBillingDate()` for monthly/yearly cycles

## ID Generation

- **`crypto.randomUUID()`** for all entity IDs (products, entries, expenses, subscriptions)
- Consistent across all create operations

## Async Patterns

- **async/await** preferred over `.then()` chains
- **Promise.all** for parallel data loading: `await Promise.all([storage.getProducts(), ...])`
- **Promise wrapper** around IndexedDB callbacks in `database.ts`
