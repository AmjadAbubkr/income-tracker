import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('financial history mutations', () => {
  beforeEach(async () => {
    await deleteDatabase();
    vi.resetModules();
  });

  it('updates a sale and reconciles tracked inventory atomically', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.addProduct({ id: 'product', name: 'Product', priceMinor: 100, inventory: 8, createdAt: '2026-08-12T00:00:00.000Z' });
    await database.checkout([{ productId: 'product', quantity: 2 }], '2026-08-12');
    const [entry] = await database.getIncomeEntries();

    const updated = await database.updateIncomeEntry(entry!.id, {
      quantity: 4,
      amountMinor: 400,
      date: '2026-08-13',
      notes: 'Updated',
    });

    expect(updated).toEqual(expect.objectContaining({ quantity: 4, amountMinor: 400, date: '2026-08-13', notes: 'Updated' }));
    await expect(database.getProducts()).resolves.toEqual([expect.objectContaining({ inventory: 4 })]);
  });

  it('rejects an edit that needs more stock without changing the old sale', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.addProduct({ id: 'product', name: 'Product', priceMinor: 100, inventory: 2, createdAt: '2026-08-12T00:00:00.000Z' });
    await database.checkout([{ productId: 'product', quantity: 1 }], '2026-08-12');
    const [entry] = await database.getIncomeEntries();

    await expect(database.updateIncomeEntry(entry!.id, { quantity: 3, amountMinor: 300 })).rejects.toThrow('Insufficient stock');
    await expect(database.getIncomeEntries()).resolves.toEqual([expect.objectContaining({ quantity: 1, amountMinor: 100 })]);
    await expect(database.getProducts()).resolves.toEqual([expect.objectContaining({ inventory: 1 })]);
  });

  it('restores inventory when a sale is deleted and rejects cross-user mutations', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.addProduct({ id: 'product', name: 'Product', priceMinor: 100, inventory: 5, createdAt: '2026-08-12T00:00:00.000Z' });
    await database.checkout([{ productId: 'product', quantity: 2 }], '2026-08-12');
    const [entry] = await database.getIncomeEntries();

    database.setUserId('other');
    await expect(database.deleteIncomeEntry(entry!.id)).rejects.toThrow('does not belong');
    database.setUserId('owner');
    await database.deleteIncomeEntry(entry!.id);

    await expect(database.getIncomeEntries()).resolves.toEqual([]);
    await expect(database.getProducts()).resolves.toEqual([expect.objectContaining({ inventory: 5 })]);
  });

  it('updates expenses through the ownership-safe mutation path', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();
    database.setUserId('owner');
    await database.addExpense({ id: 'expense', category: 'Tools', amountMinor: 500, date: '2026-08-12', description: 'Old' });

    await expect(database.updateExpense('expense', { amountMinor: 750, description: 'New' })).resolves.toEqual(
      expect.objectContaining({ amountMinor: 750, description: 'New', userId: 'owner' }),
    );
    database.setUserId('other');
    await expect(database.updateExpense('expense', { description: 'Overwritten' })).rejects.toThrow('does not belong');
  });
});
