import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateNextBillingDate } from '../src/utils/dateUtils';

const DB_NAME = 'IncomeTrackerDB';
let activeDatabase: { close: () => void } | undefined;

afterEach(() => {
  activeDatabase?.close();
  activeDatabase = undefined;
});

const deleteDatabase = () => new Promise<void>((resolve, reject) => {
  const request = indexedDB.deleteDatabase(DB_NAME);
  request.onsuccess = () => resolve();
  request.onerror = () => reject(request.error);
});

describe('financial storage transactions', () => {
  beforeEach(async () => {
    await deleteDatabase();
    vi.resetModules();
  });

  it('does not write a partial checkout when any tracked item lacks stock', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.addProduct({ id: 'in-stock', name: 'In stock', priceMinor: 100, inventory: 3, createdAt: '2026-08-12T00:00:00.000Z' });
    await database.addProduct({ id: 'out-of-stock', name: 'Out of stock', priceMinor: 200, inventory: 1, createdAt: '2026-08-12T00:00:00.000Z' });

    await expect(database.checkout([
      { productId: 'in-stock', quantity: 1 },
      { productId: 'out-of-stock', quantity: 2 },
    ], '2026-08-12')).rejects.toThrow('Insufficient stock');

    await expect(database.getIncomeEntries()).resolves.toEqual([]);
    await expect(database.getProducts()).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'in-stock', inventory: 3 }),
      expect.objectContaining({ id: 'out-of-stock', inventory: 1 }),
    ]));
  });

  it('writes checkout ledger entries and stock changes together', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.addProduct({ id: 'product', name: 'Product', priceMinor: 299, inventory: 5, createdAt: '2026-08-12T00:00:00.000Z' });

    await database.checkout([{ productId: 'product', quantity: 2 }], '2026-08-12', 'Sale note');

    await expect(database.getIncomeEntries()).resolves.toEqual([
      expect.objectContaining({ productId: 'product', quantity: 2, amountMinor: 598, date: '2026-08-12', notes: 'Sale note' }),
    ]);
    await expect(database.getProducts()).resolves.toEqual([expect.objectContaining({ id: 'product', inventory: 3 })]);
  });

  it('records overdue subscriptions once, advances them atomically, and is idempotent on repeat', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.saveBusinessSubscriptions([{ id: 'business', name: 'Hosting', amountMinor: 500, billingCycle: 'monthly', category: 'Software', nextBillingDate: '2026-01-31', status: 'active' }]);
    await database.saveCustomerSubscriptions([{ id: 'customer', customerName: 'Ada', serviceName: 'Support', amountMinor: 900, billingCycle: 'monthly', startDate: '2026-01-31', nextBillingDate: '2026-01-31', status: 'active' }]);

    const firstRun = await database.processDueSubscriptions('2026-03-01');
    const secondRun = await database.processDueSubscriptions('2026-03-01');

    expect(firstRun.newExpenses).toHaveLength(2);
    expect(firstRun.newIncome).toHaveLength(2);
    expect(secondRun.newExpenses).toEqual([]);
    expect(secondRun.newIncome).toEqual([]);
    await expect(database.getExpenses()).resolves.toHaveLength(2);
    await expect(database.getIncomeEntries()).resolves.toHaveLength(2);
    await expect(database.getBusinessSubscriptions()).resolves.toEqual([expect.objectContaining({ nextBillingDate: '2026-03-31' })]);
    await expect(database.getCustomerSubscriptions()).resolves.toEqual([expect.objectContaining({ nextBillingDate: '2026-03-31' })]);
  });

  it('rejects an invalid backup before changing any current records', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.addProduct({ id: 'existing', name: 'Existing', priceMinor: 100, createdAt: '2026-08-12T00:00:00.000Z' });

    await expect(database.restoreBackup({ products: [], incomeEntries: 'invalid' } as unknown)).rejects.toThrow('Invalid backup');
    await expect(database.getProducts()).resolves.toEqual([expect.objectContaining({ id: 'existing' })]);
  });

  it('replaces every financial store in one validated restore', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.restoreBackup({
      products: [{ id: 'product', name: 'Restored', priceMinor: 250, inventory: 4, createdAt: '2026-08-01T00:00:00.000Z' }],
      incomeEntries: [{ id: 'income', productId: 'product', quantity: 1, amountMinor: 250, date: '2026-08-02' }],
      expenses: [{ id: 'expense', category: 'Tools', amountMinor: 50, date: '2026-08-02', description: 'Tool' }],
      categories: [{ id: 'category', name: 'Services', createdAt: '2026-08-01T00:00:00.000Z' }],
      businessSubscriptions: [{ id: 'business', name: 'Hosting', amountMinor: 500, billingCycle: 'monthly', category: 'Tools', nextBillingDate: '2026-08-31', status: 'active' }],
      customerSubscriptions: [{ id: 'customer', customerName: 'Ada', serviceName: 'Support', amountMinor: 900, billingCycle: 'monthly', startDate: '2026-08-31', nextBillingDate: '2026-08-31', status: 'active' }],
    });

    await expect(database.getProducts()).resolves.toEqual([expect.objectContaining({ id: 'product', userId: 'owner' })]);
    await expect(database.getIncomeEntries()).resolves.toEqual([expect.objectContaining({ id: 'income', userId: 'owner' })]);
    await expect(database.getExpenses()).resolves.toEqual([expect.objectContaining({ id: 'expense', userId: 'owner' })]);
    await expect(database.getCategories()).resolves.toEqual([expect.objectContaining({ id: 'category', userId: 'owner' })]);
    await expect(database.getBusinessSubscriptions()).resolves.toEqual([expect.objectContaining({ id: 'business', userId: 'owner' })]);
    await expect(database.getCustomerSubscriptions()).resolves.toEqual([expect.objectContaining({ id: 'customer', userId: 'owner' })]);
  });
});

describe('date-only billing rules', () => {
  it('keeps month-end schedules on the end of each following month', () => {
    expect(calculateNextBillingDate('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(calculateNextBillingDate('2026-02-28', 'monthly')).toBe('2026-03-31');
    expect(calculateNextBillingDate('2024-02-29', 'yearly')).toBe('2025-02-28');
  });
});
