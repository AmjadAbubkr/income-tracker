import { describe, expect, it } from 'vitest';
import { translations } from '../src/translations';
import { isLowStock, isWithinNextDays } from '../src/context/NotificationContext';

describe('notifications and translations', () => {
  it('uses the agreed notification thresholds', () => {
    expect(isLowStock(5)).toBe(true);
    expect(isLowStock(6)).toBe(false);
    expect(isLowStock(undefined)).toBe(false);
    expect(isWithinNextDays('2026-08-15', '2026-08-12', 3)).toBe(true);
    expect(isWithinNextDays('2026-08-16', '2026-08-12', 3)).toBe(false);
    expect(isWithinNextDays('2026-08-11', '2026-08-12', 3)).toBe(false);
  });

  it('has translated values for the Phase 10 shared-shell copy', () => {
    const keys = [
      'salesHistory', 'noSalesHistory', 'printReport', 'financialSummary',
      'noNewNotifications', 'lowStockAlert', 'stockRunningLow',
      'upcomingPayment', 'upcomingRevenue', 'profileInformation',
      'accountSecurity', 'systemPreferences', 'productCategories',
    ] as const;

    keys.forEach((key) => {
      expect(translations.en[key]).toBeTruthy();
      expect(translations.fr[key]).toBeTruthy();
      expect(translations.ar[key]).toBeTruthy();
    });
  });
});
