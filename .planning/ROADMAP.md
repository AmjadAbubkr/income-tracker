# ROADMAP: IncomeTrack — Business Income & Sales Tracker

**Created:** 2026-05-17
**Granularity:** Fine (9 phases)
**Coverage:** 39/39 v1 requirements mapped

## Phases

- [ ] **Phase 1: Backend Foundation & Authentication** — Project scaffolding, database schema, user registration/login, session management, protected routes
- [ ] **Phase 2: Product & Item Management** — CRUD for products/items, custom categories, stock tracking
- [ ] **Phase 3: Sales Recording** — Record/edit/delete sales, sales history with filtering, bulk entry
- [ ] **Phase 4: Expense Tracking** — Record/edit/delete expenses, expense history with filtering
- [ ] **Phase 5: Subscription Management** — Track business costs and customer recurring revenue, auto-generate entries on billing dates
- [ ] **Phase 6: Dashboard & Analytics** — Revenue/expense/net profit summaries, charts, top items, activity feed, period views
- [ ] **Phase 7: Notifications** — Low stock alerts, subscription billing reminders
- [ ] **Phase 8: Settings & Profile** — Currency, theme, language, profile management
- [ ] **Phase 9: Reporting & Export** — Excel exports, JSON backup/restore, period summaries, PDF reports

## Phase Details

### Phase 1: Backend Foundation & Authentication
**Goal**: Users can create accounts, log in securely, and access a protected application with full multi-tenant data isolation
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can create an account with email and password
  2. User can log in with email and password and access protected routes
  3. User stays logged in across browser refresh (session persistence)
  4. User can log out from any page and is redirected to login
  5. Each user's data is fully isolated — no cross-tenant data leakage
**Plans**: TBD
**UI hint**: yes

### Phase 2: Product & Item Management
**Goal**: Users can manage their product catalog with custom categories and optional stock tracking
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05
**Success Criteria** (what must be TRUE):
  1. User can add a product with name, price, category, optional description, and optional stock quantity
  2. User can edit an existing product's details
  3. User can delete a product from their catalog
  4. User can create custom categories and assign them to products
  5. User can view their full product list with category and stock information
**Plans**: TBD
**UI hint**: yes

### Phase 3: Sales Recording
**Goal**: Users can record, manage, and review all their sales transactions
**Depends on**: Phase 1, Phase 2
**Requirements**: SALE-01, SALE-02, SALE-03, SALE-04, SALE-05
**Success Criteria** (what must be TRUE):
  1. User can record a sale with product, quantity, amount, and date
  2. User can edit an existing sale record
  3. User can delete a sale record
  4. User can view sales history filtered by date range and product
  5. User can enter multiple sales at once via bulk/batch entry
**Plans**: TBD
**UI hint**: yes

### Phase 4: Expense Tracking
**Goal**: Users can track and categorize all business expenses
**Depends on**: Phase 1
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04
**Success Criteria** (what must be TRUE):
  1. User can record an expense with category, amount, date, and description
  2. User can edit an existing expense
  3. User can delete an expense
  4. User can view expense history filtered by date range and category
**Plans**: TBD
**UI hint**: yes

### Phase 5: Subscription Management
**Goal**: Users can track recurring business costs and customer revenue, with automatic entry generation on billing dates
**Depends on**: Phase 1, Phase 3, Phase 4
**Requirements**: SUB-01, SUB-02, SUB-03, SUB-04
**Success Criteria** (what must be TRUE):
  1. User can track business subscriptions (recurring costs) with name, amount, billing cycle, and next billing date
  2. User can track customer subscriptions (recurring revenue) with customer name, service, amount, billing cycle, and next billing date
  3. System automatically generates expense entries when a business subscription billing date arrives
  4. System automatically generates income entries when a customer subscription billing date arrives
**Plans**: TBD
**UI hint**: yes

### Phase 6: Dashboard & Analytics
**Goal**: Users can instantly see their financial health through summary cards, charts, and activity feeds
**Depends on**: Phase 3, Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. User sees revenue, expense, and net profit summary cards on the dashboard
  2. User can toggle between daily, monthly, and all-time views
  3. User sees a revenue vs expenses chart
  4. User sees top products/items ranked by revenue
  5. User sees a recent activity feed showing latest sales and expenses
**Plans**: TBD
**UI hint**: yes

### Phase 7: Notifications
**Goal**: Users receive timely alerts for low stock and upcoming subscription billing
**Depends on**: Phase 2, Phase 5
**Requirements**: NOTF-01, NOTF-02
**Success Criteria** (what must be TRUE):
  1. User receives an in-app alert when any product's stock drops to 5 or fewer items
  2. User receives an in-app reminder when a subscription billing date is within 3 days
**Plans**: TBD
**UI hint**: yes

### Phase 8: Settings & Profile
**Goal**: Users can customize their experience and manage their profile
**Depends on**: Phase 1
**Requirements**: SET-01, SET-02, SET-03, SET-04
**Success Criteria** (what must be TRUE):
  1. User can select their default currency for all financial displays
  2. User can toggle between dark and light theme (persisted across sessions)
  3. User can switch between English, French, and Arabic languages (with RTL support for Arabic)
  4. User can view and edit their profile (name, email)
**Plans**: TBD
**UI hint**: yes

### Phase 9: Reporting & Export
**Goal**: Users can export their financial data in multiple formats and generate summary reports
**Depends on**: Phase 3, Phase 4, Phase 5
**Requirements**: RPT-01, RPT-02, RPT-03, RPT-04, RPT-05, RPT-06
**Success Criteria** (what must be TRUE):
  1. User can export daily sales to an Excel file
  2. User can export monthly sales to an Excel file
  3. User can download a full JSON backup of all their data
  4. User can restore their data from a previously downloaded JSON backup file
  5. User can view a period summary report showing revenue, expenses, and net profit
  6. User can export a PDF report of their financial summary
**Plans**: TBD
**UI hint**: yes

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Backend Foundation & Authentication | 0/0 | Not started | - |
| 2. Product & Item Management | 0/0 | Not started | - |
| 3. Sales Recording | 0/0 | Not started | - |
| 4. Expense Tracking | 0/0 | Not started | - |
| 5. Subscription Management | 0/0 | Not started | - |
| 6. Dashboard & Analytics | 0/0 | Not started | - |
| 7. Notifications | 0/0 | Not started | - |
| 8. Settings & Profile | 0/0 | Not started | - |
| 9. Reporting & Export | 0/0 | Not started | - |

## Coverage Validation

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| PROD-01 | Phase 2 | Pending |
| PROD-02 | Phase 2 | Pending |
| PROD-03 | Phase 2 | Pending |
| PROD-04 | Phase 2 | Pending |
| PROD-05 | Phase 2 | Pending |
| SALE-01 | Phase 3 | Pending |
| SALE-02 | Phase 3 | Pending |
| SALE-03 | Phase 3 | Pending |
| SALE-04 | Phase 3 | Pending |
| SALE-05 | Phase 3 | Pending |
| EXP-01 | Phase 4 | Pending |
| EXP-02 | Phase 4 | Pending |
| EXP-03 | Phase 4 | Pending |
| EXP-04 | Phase 4 | Pending |
| SUB-01 | Phase 5 | Pending |
| SUB-02 | Phase 5 | Pending |
| SUB-03 | Phase 5 | Pending |
| SUB-04 | Phase 5 | Pending |
| DASH-01 | Phase 6 | Pending |
| DASH-02 | Phase 6 | Pending |
| DASH-03 | Phase 6 | Pending |
| DASH-04 | Phase 6 | Pending |
| DASH-05 | Phase 6 | Pending |
| NOTF-01 | Phase 7 | Pending |
| NOTF-02 | Phase 7 | Pending |
| SET-01 | Phase 8 | Pending |
| SET-02 | Phase 8 | Pending |
| SET-03 | Phase 8 | Pending |
| SET-04 | Phase 8 | Pending |
| RPT-01 | Phase 9 | Pending |
| RPT-02 | Phase 9 | Pending |
| RPT-03 | Phase 9 | Pending |
| RPT-04 | Phase 9 | Pending |
| RPT-05 | Phase 9 | Pending |
| RPT-06 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0 ✓

---
*Roadmap created: 2026-05-17*
