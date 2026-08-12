import { describe, expect, it } from 'vitest';
import { buildPeriodReport, getDateRange, groupReportAmounts } from '../src/utils/reporting';

const product = { id: 'product', name: 'Product', priceMinor: 100, createdAt: '2026-01-01T00:00:00.000Z' };

describe('period reporting', () => {
  it('builds inclusive daily and monthly ranges', () => {
    expect(getDateRange('daily', '2026-02-28')).toEqual({ start: '2026-02-28', end: '2026-02-28' });
    expect(getDateRange('monthly', '2026-02-28')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
  });

  it('filters revenue and expenses together and computes net profit', () => {
    const report = buildPeriodReport(
      [
        { id: 'sale-in', productId: 'product', quantity: 2, amountMinor: 200, date: '2026-02-28' },
        { id: 'sale-out', productId: 'product', quantity: 1, amountMinor: 100, date: '2026-03-01' },
      ],
      [
        { id: 'expense-in', category: 'Tools', amountMinor: 50, date: '2026-02-28', description: 'Hosting' },
        { id: 'expense-out', category: 'Tools', amountMinor: 25, date: '2026-03-01', description: 'Other' },
      ],
      [product],
      'monthly',
      '2026-02-28',
    );

    expect(report.totalRevenueMinor).toBe(200);
    expect(report.totalExpensesMinor).toBe(50);
    expect(report.netProfitMinor).toBe(150);
    expect(report.totalItems).toBe(2);
    expect(report.topProducts[0]).toEqual(expect.objectContaining({ revenueMinor: 200, quantity: 2 }));
    expect(report.recentActivity.map((item) => item.id)).toEqual(['sale-in', 'expense-in']);
  });

  it('groups both series for chart data', () => {
    const grouped = groupReportAmounts({
      incomeEntries: [{ id: 'sale', productId: 'product', quantity: 1, amountMinor: 200, date: '2026-02-28' }],
      expenses: [{ id: 'expense', category: 'Tools', amountMinor: 50, date: '2026-02-28', description: 'Hosting' }],
    }, 'monthly');

    expect(grouped).toEqual([{ name: '2026-02', revenueMinor: 200, expensesMinor: 50 }]);
  });
});
