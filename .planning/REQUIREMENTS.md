# Requirements: IncomeTrack — Business Income & Sales Tracker

**Defined:** 2026-05-17
**Core Value:** A business can sign up, add their items with flexible categories, record sales and expenses, and instantly see their revenue dashboard — the complete end-to-end flow must work flawlessly.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: User can log out from any page

### Dashboard

- [ ] **DASH-01**: User sees revenue, expense, and net profit summary cards
- [ ] **DASH-02**: User can toggle between daily, monthly, and all-time views
- [ ] **DASH-03**: User sees revenue vs expenses chart
- [ ] **DASH-04**: User sees top products/items ranked by revenue
- [ ] **DASH-05**: User sees recent activity feed (latest sales and expenses)

### Product/Item Management

- [ ] **PROD-01**: User can add a product/item with name, price, category, and optional description
- [ ] **PROD-02**: User can edit an existing product/item
- [ ] **PROD-03**: User can delete a product/item
- [ ] **PROD-04**: User can create and assign custom categories to products
- [ ] **PROD-05**: User can track optional inventory/stock quantity per product

### Sales Recording

- [ ] **SALE-01**: User can record a sale with product, quantity, amount, and date
- [ ] **SALE-02**: User can edit an existing sale record
- [ ] **SALE-03**: User can delete a sale record
- [ ] **SALE-04**: User can view sales history with date and product filtering
- [ ] **SALE-05**: User can enter multiple sales in bulk (batch entry)

### Expense Tracking

- [ ] **EXP-01**: User can record an expense with category, amount, date, and description
- [ ] **EXP-02**: User can edit an existing expense
- [ ] **EXP-03**: User can delete an expense
- [ ] **EXP-04**: User can view expense history with date and category filtering

### Subscription Management

- [ ] **SUB-01**: User can track business subscriptions (recurring costs) with name, amount, billing cycle, and next billing date
- [ ] **SUB-02**: User can track customer subscriptions (recurring revenue) with customer name, service, amount, billing cycle, and next billing date
- [ ] **SUB-03**: System auto-generates expense entries when business subscription billing date arrives
- [ ] **SUB-04**: System auto-generates income entries when customer subscription billing date arrives

### Reporting & Export

- [ ] **RPT-01**: User can export daily sales to Excel
- [ ] **RPT-02**: User can export monthly sales to Excel
- [ ] **RPT-03**: User can download a full JSON backup of their data
- [ ] **RPT-04**: User can restore data from a JSON backup file
- [ ] **RPT-05**: User can view a period summary report (revenue, expenses, net profit)
- [ ] **RPT-06**: User can export a PDF report of their financial summary

### Notifications

- [ ] **NOTF-01**: User receives an alert when a product's stock is low (≤5 items)
- [ ] **NOTF-02**: User receives a reminder when a subscription billing date is within 3 days

### Settings

- [ ] **SET-01**: User can select their default currency
- [ ] **SET-02**: User can toggle between dark and light theme
- [ ] **SET-03**: User can switch between English, French, and Arabic languages
- [ ] **SET-04**: User can view and edit their profile (name, email)

## v2 Requirements

### Authentication

- **AUTH-05**: User receives email verification after signup
- **AUTH-06**: User can reset password via email link
- **AUTH-07**: User can enable 2FA (TOTP)

### Sales & Expenses

- **SALE-06**: User can record sales in multiple currencies
- **EXP-05**: User can upload receipt images with expenses
- **SALE-07**: User can set up recurring income schedules

### Reporting

- **RPT-07**: User can schedule automated email reports
- **RPT-08**: User can generate custom date range reports

### Notifications

- **NOTF-03**: User receives revenue milestone celebrations
- **NOTF-04**: User receives weekly summary digest

### Intelligence

- **NOTF-05**: AI-powered transaction categorization
- **DASH-06**: Predictive cash flow forecasting
- **DASH-07**: Anomaly detection for duplicate or unusual entries

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full double-entry accounting | Scope explosion — this is an income tracker, not an accounting system |
| Payroll processing | Different product domain, high regulatory complexity |
| CRM / pipeline management | Not core to income tracking |
| Warehouse inventory management | Overkill for target audience |
| Bank feed integration (Plaid/Tiller) | High complexity, defer to validate product-market fit first |
| OAuth / social login | Email/password sufficient for v1, adds dependency complexity |
| Team collaboration / multi-user per business | Single-owner model for v1, adds RBAC complexity |
| Invoice generation | Sales recording is the focus, not billing clients |
| Mobile native app | Responsive web covers mobile use cases for v1 |

## Traceability

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
| SALE-01 | Phase 2 | Pending |
| SALE-02 | Phase 2 | Pending |
| SALE-03 | Phase 2 | Pending |
| SALE-04 | Phase 2 | Pending |
| SALE-05 | Phase 2 | Pending |
| EXP-01 | Phase 2 | Pending |
| EXP-02 | Phase 2 | Pending |
| EXP-03 | Phase 2 | Pending |
| EXP-04 | Phase 2 | Pending |
| SUB-01 | Phase 3 | Pending |
| SUB-02 | Phase 3 | Pending |
| SUB-03 | Phase 3 | Pending |
| SUB-04 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| NOTF-01 | Phase 3 | Pending |
| NOTF-02 | Phase 3 | Pending |
| RPT-01 | Phase 4 | Pending |
| RPT-02 | Phase 4 | Pending |
| RPT-03 | Phase 4 | Pending |
| RPT-04 | Phase 4 | Pending |
| RPT-05 | Phase 4 | Pending |
| RPT-06 | Phase 4 | Pending |
| SET-01 | Phase 4 | Pending |
| SET-02 | Phase 4 | Pending |
| SET-03 | Phase 4 | Pending |
| SET-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after initial definition*
