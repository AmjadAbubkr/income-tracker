# Feature Landscape

**Domain:** Business income/sales tracking SaaS
**Researched:** 2026-05-17

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **User registration & login** | Every SaaS needs auth | Low | Better Auth handles email/password + OAuth out of the box |
| **Dashboard overview** | First screen after login | Medium | Income summary, recent transactions, charts, key metrics |
| **Add income/transaction** | Core functionality | Low | Form with date, amount, category, description, client |
| **Transaction list** | View all records | Medium | Sortable, filterable, paginated table with search |
| **Edit/delete transactions** | Data correction | Low | Inline editing or modal form |
| **Categories/tags** | Organize income sources | Low | User-defined categories (freelance, salary, sales, etc.) |
| **Date range filtering** | Period analysis | Low | Custom date ranges, presets (this month, last quarter, YTD) |
| **Income totals & summaries** | Financial reporting | Medium | Totals by category, by period, by client |
| **Charts/visualizations** | Trend analysis | Medium | Line charts (income over time), bar charts (by category), pie charts (distribution) |
| **Export to CSV/PDF** | External reporting | Medium | CSV is straightforward; PDF requires a library |
| **Responsive design** | Mobile access | Medium | Dashboard must work on tablets and phones |
| **Multi-currency support** | International users | Medium | Currency conversion, display formatting |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Recurring income tracking** | Automate regular income entries | Medium | Set up recurring patterns (weekly, monthly, quarterly) |
| **Invoice generation** | Professional billing | High | PDF invoice templates, client management, payment tracking |
| **Tax estimation** | Financial planning | Medium | Calculate estimated taxes based on income, deductions |
| **Client management** | Freelancer/business focus | Medium | Track income per client, contact info, payment history |
| **Goal tracking** | Motivation | Low | Set income targets, track progress visually |
| **Multi-user/teams** | Business collaboration | High | Role-based access, shared workspaces |
| **Bank statement import** | Reduce manual entry | High | CSV import with auto-categorization |
| **Real-time notifications** | Stay informed | Medium | Email/webhook alerts for large transactions, goals hit |
| **API access** | Integration | Medium | REST API for third-party integrations |
| **Dark mode** | User preference | Low | Theme toggle with persistence |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full accounting system** | Scope creep — this is income tracking, not QuickBooks | Focus on income/revenue side only; expenses can be a future phase |
| **Real-time bank sync (Plaid)** | Expensive, complex, regulatory overhead | CSV import is sufficient for MVP; bank sync is a premium feature |
| **Multi-language (i18n)** | Adds complexity without validating demand | English-first; add i18n only if user demand emerges |
| **Native mobile app** | Web app covers 95% of use cases for this domain | Ensure responsive web design; PWA can be added later |
| **AI-powered insights** | Gimmicky without sufficient data | Start with deterministic analytics; add ML when you have enough data |
| **Cryptocurrency tracking** | Niche, adds volatility complexity | Focus on fiat currency; crypto can be a separate product |

## Feature Dependencies

```
User Auth → Dashboard → Transaction CRUD → Categories
Transaction CRUD → Charts/Visualizations → Export
Categories → Income Summaries → Tax Estimation
Transaction CRUD → Recurring Income → Notifications
Client Management → Invoice Generation
Transaction CRUD → Bank Statement Import (CSV parsing)
User Auth → Multi-user/Teams → Role-based Access
```

## MVP Recommendation

Prioritize:
1. **User registration & login** — Foundation for everything
2. **Transaction CRUD** — Core value proposition
3. **Dashboard with charts** — Immediate visual value
4. **Categories & filtering** — Essential organization
5. **Export to CSV** — Basic reporting

Defer:
- **Invoice generation** — High complexity, not core to income tracking
- **Bank sync** — Expensive API, complex integration
- **Multi-user/teams** — Requires auth overhaul, defer until single-user is validated
- **Tax estimation** — Jurisdiction-specific complexity
- **Recurring income** — Useful but not essential for MVP

## Sources

- Competitor analysis: Wave Apps, FreshBooks, QuickBooks Self-Employed, Harvest
- SaaS income tracking patterns from indie hacker communities
- Financial dashboard UX best practices
