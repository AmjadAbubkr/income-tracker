import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AnalyticsCharts from '../src/components/AnalyticsCharts';

vi.mock('../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      noDataForPeriod: 'No data for this period.',
      unknown: 'Unknown',
      totalExpenses: 'Total expenses',
      totalRevenue: 'Total revenue',
      revenueVsExpenses: 'Revenue vs Expenses',
      topProducts: 'Top Products',
      revenueByCategory: 'Revenue by Category',
    },
  }),
}));

vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

describe('analytics chart empty states', () => {
  it('explains when each chart has no data instead of rendering a blank surface', () => {
    render(
      <AnalyticsCharts
        incomeEntries={[]}
        expenses={[]}
        products={[]}
        currency="USD"
        viewMode="weekly"
      />,
    );

    expect(screen.getAllByText('No data for this period.')).toHaveLength(3);
  });
});
