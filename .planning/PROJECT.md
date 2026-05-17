# IncomeTrack — Business Income & Sales Tracker

## What This Is

A modern web-based SaaS platform that helps businesses of any size manage and track their income, sales, expenses, and analytics. Built as a hybrid evolution of an existing React + TypeScript client-side app, now with a proper Node.js + PostgreSQL backend, multi-tenant architecture with full data isolation per business, and flexible category-based data organization.

## Core Value

A business can sign up, add their items with flexible categories, record sales and expenses, and instantly see their revenue dashboard — the complete end-to-end flow must work flawlessly.

## Requirements

### Validated

- ✓ Existing React SPA with product/income/expense tracking UI — existing codebase
- ✓ IndexedDB-based local data persistence — existing codebase
- ✓ Multi-language support (EN, FR, AR) with RTL — existing codebase
- ✓ Dark/light theme toggle — existing codebase
- ✓ Excel export for sales reports — existing codebase
- ✓ JSON backup/restore — existing codebase

### Active

- [ ] User registration and login with email/password
- [ ] Email verification and password reset
- [ ] Session persistence across browser refresh
- [ ] Multi-tenant architecture with full business data isolation
- [ ] Flexible category system for income, expenses, and items
- [ ] Product/item management with custom fields
- [ ] Sales recording with quantity, amount, date tracking
- [ ] Expense tracking with categorization
- [ ] Revenue dashboard with daily/monthly/period views
- [ ] Analytics with charts (revenue vs expenses, trends, top items)
- [ ] Subscription tracking (business costs and customer recurring revenue)
- [ ] Data export (Excel, JSON backup)
- [ ] Responsive design (desktop + mobile)

### Out of Scope

- Payment processing / billing — monetization is "free for now"
- OAuth / social login — email/password sufficient for v1
- Team collaboration / multi-user per business — single-owner for v1
- Real-time notifications — can be added later
- Mobile native app — responsive web is sufficient
- Invoice generation — sales recording is the focus, not invoicing

## Context

**Existing codebase:** A React + TypeScript SPA (Vite) with IndexedDB storage, already implementing product management, sales tracking, expense logging, subscription management, analytics with charts, Excel export, JSON backup/restore, i18n (EN/FR/AR), dark/light themes, and a notification system.

**Architecture concerns in existing codebase:**
- All state in single App.tsx component
- Bulk-save pattern (delete all + re-add) is inefficient
- Passwords stored in plaintext in IndexedDB
- No tests exist
- No backend — fully client-side
- No package.json or config files at root

**What carries forward:** All existing patterns — UI components, forms, charts, styling, business logic for subscriptions/daily stats/calculations, type definitions, and i18n structure serve as reference for the new architecture.

**Domain:** Business income tracking is a crowded space (QuickBooks, Wave, FreshBooks). Differentiation comes from simplicity, flexibility, and modern UX — not feature parity with accounting giants.

## Constraints

- **Tech stack**: Node.js + PostgreSQL backend, React frontend (TypeScript throughout) — user preference for consistency and ecosystem
- **Timeline**: "Build it right" — no rush, quality over speed
- **Multi-tenant**: Full data isolation per business — each business gets its own isolated data space
- **Budget**: Free for now — no payment integration needed in v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid evolution over rebuild | Existing codebase has solid UI patterns and business logic worth preserving | — Pending |
| Node.js + PostgreSQL | TypeScript end-to-end, strong ecosystem for SaaS | — Pending |
| Flexible categories over rigid schema | Businesses have diverse tracking needs, rigid models limit adoption | — Pending |
| Full data isolation per business | Simpler security model, easier to reason about, cleaner multi-tenant design | — Pending |
| Email/password auth only for v1 | Reduces complexity, sufficient for validation phase | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-17 after initialization*
