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

describe('local profile boundaries', () => {
  beforeEach(async () => {
    await deleteDatabase();
    vi.resetModules();
  });

  it('keeps records private when users switch and rejects cross-user deletes', async () => {
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    activeDatabase = database;
    await database.init();

    database.setUserId('user-a');
    await database.addProduct({ id: 'a-product', name: 'A only', priceMinor: 100, createdAt: '2026-08-12T00:00:00.000Z' });

    database.setUserId('user-b');
    await database.addProduct({ id: 'b-product', name: 'B only', priceMinor: 200, createdAt: '2026-08-12T00:00:00.000Z' });
    await expect(database.getProducts()).resolves.toEqual([expect.objectContaining({ id: 'b-product' })]);
    await expect(database.updateProduct('a-product', { name: 'Overwritten' })).rejects.toThrow('does not belong');
    await expect(database.deleteProduct('a-product')).rejects.toThrow('does not belong');

    database.setUserId('user-a');
    await expect(database.getProducts()).resolves.toEqual([expect.objectContaining({ id: 'a-product', name: 'A only' })]);
  });
});
