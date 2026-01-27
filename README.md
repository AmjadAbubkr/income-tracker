# Income Tracker App

Modern web app for tracking income, inventory, and analytics with a professional cold-themed UI.

## Key Features

- ✅ Products & inventory
  - Add products with name, price, description, optional image
  - Optional inventory tracking with low/out-of-stock indicators
  - Delete products (removes related income entries)
- ✅ Sales recording
  - Quick record per product with quantity, date, notes
  - Prevents overselling when inventory tracking is enabled
  - Inline quantity controls and totals per product
- ✅ Analytics & exports
  - Dashboard with totals and today’s stats (auto-resets daily)
  - Excel export (daily/monthly) with summaries and breakdowns
  - Currency selector with multiple currencies supported
- ✅ UI/UX
  - Professional cold color palette, compact layout
  - Mobile-friendly responsive design
  - Modals for Add Product and Record Income in one Sales page
  - Product cards with images and inventory display
- ✅ Data persistence
  - IndexedDB (with localStorage backup) for products and income
  - Automatic migration from localStorage

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# open http://localhost:5173
```

### Build
```bash
npm run build
# output: dist/
```

## Usage

1) Sales page
   - Click “Sales” in the navbar
   - Use “Add Product” (modal) to create products (optionally track inventory & add image)
   - Use “Record Income” (modal) or inline product cards to log sales

2) Dashboard
   - View totals, today’s stats (reset daily), product overviews, recent income entries
   - Export daily/monthly Excel reports
   - Delete products or income entries as needed

3) Inventory
   - Enable “Track Inventory” when adding a product
   - Stock decreases on sales and restores if a sale is deleted
   - Low/out-of-stock highlighted on product cards

4) Currency
   - Switch currency from the navbar; amounts update everywhere

## Technology Stack
- React 18 + TypeScript + Vite
- CSS (custom, responsive, cold professional theme)
- IndexedDB (with localStorage fallback)
- xlsx (Excel export)

## Design Notes
- Cold, professional palette (blues, slates, cyan accents)
- Compact spacing, subtle borders/shadows, rounded corners
- Touch-friendly controls and mobile-first breakpoints

## Data & Persistence
- Products and income entries stored in IndexedDB; localStorage backup
- Daily stats auto-reset each day

