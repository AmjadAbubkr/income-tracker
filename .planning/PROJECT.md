# IncomeTrack — Business Income & Sales Tracker (100% Offline Local App)

## What This Is

IncomeTrack is a modern, web-based business sales, income, and expense tracking application. It runs **100% client-side (offline-first)** on the user's local machine, storing all accounts and financial data in the browser's IndexedDB. There is no remote backend server, no internet connection required, and no external cloud database dependency.

## Core Value

A business owner can open the app locally, configure a privacy password/PIN, set their base currency, record sales/expenses, manage a product inventory catalog, and view real-time business health metrics directly on a local dashboard with complete privacy.

## Requirements & Scope

### Validated & Implemented locally
- ✓ 100% Offline local data persistence via browser IndexedDB.
- ✓ Multi-language support (EN, FR, AR) with native RTL support.
- ✓ Dark and light theme toggle (integrated with the Stitch "Executive Precision" visual styles).
- ✓ Local user accounts and sign-in/sign-up screen for privacy and local profiles isolation.
- ✓ Dashboard analytics with interactive charts.
- ✓ Automated subscription recording for business costs and client recurring income.
- ✓ CSV/Excel export for financial reporting.
- ✓ Full JSON backup and restore.

### Out of Scope (By Design)
- Server-side database sync (PostgreSQL) — data resides strictly on the local client machine.
- OAuth / Social Sign-In — email/password checks are done 100% locally against IndexedDB.
- Cross-device sync — local backups (JSON) are used to move data manually between devices if needed.

## Architecture Context

*   **Frontend:** React 19 + Vite + Zustand + TanStack Query.
*   **Database:** IndexedDB (implemented in `src/utils/database.ts`) handles user records, products, sales, expenses, and recurring subscriptions.
*   **User Isolation:** Although running 100% offline, multiple local users can register profiles. When a user logs in, their user ID is set in `storage.setUserId(id)`, and all subsequent IndexedDB queries automatically scope transaction results to that specific user ID.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 100% Local Offline App | The target audience wants a local app where no sensitive financial data leaves their machines. | Applied |
| Local IndexedDB | Browser-based, structured, reliable database that does not have the 5MB limits of localStorage. | Applied |
| Maintain Sign-up/Login UI | Keeps the visual shell of profiles, allowing multiple people to share a device with separate data spaces. | Applied |

---
*Last updated: 2026-05-20 (Architectural pivot to local-only offline)*
