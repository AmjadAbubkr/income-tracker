import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatCurrency, formatMoneyInput, parseMoneyInput } from '../src/utils/currency';

const DB_NAME = 'IncomeTrackerDB';

const deleteDatabase = () => new Promise<void>((resolve, reject) => {
  const request = indexedDB.deleteDatabase(DB_NAME);
  request.onsuccess = () => resolve();
  request.onerror = () => reject(request.error);
});

const createLegacyDatabase = () => new Promise<void>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 5);
  request.onupgradeneeded = () => {
    const db = request.result;
    const users = db.createObjectStore('users', { keyPath: 'id' });
    users.createIndex('email', 'email', { unique: true });
    const products = db.createObjectStore('products', { keyPath: 'id' });
    products.createIndex('name', 'name');
    products.createIndex('createdAt', 'createdAt');
    products.createIndex('userId', 'userId');
  };
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction('products', 'readwrite');
    transaction.objectStore('products').add({
      id: 'legacy-product',
      userId: 'user-1',
      name: 'Legacy product',
      price: 19.99,
      createdAt: '2026-08-12T00:00:00.000Z',
    });
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  };
  request.onerror = () => reject(request.error);
});

describe('exact money conversion', () => {
  it('converts decimal input without floating-point persistence', () => {
    expect(parseMoneyInput('0.1', 'USD')).toBe(10);
    expect(parseMoneyInput('19.99', 'USD')).toBe(1999);
    expect(parseMoneyInput('19.999', 'USD')).toBeNull();
    expect(parseMoneyInput('100', 'JPY')).toBe(100);
    expect(formatMoneyInput(1999, 'USD')).toBe('19.99');
    expect(formatCurrency(1999, 'USD')).toContain('19.99');
  });

  it('migrates legacy floating-point IndexedDB records to minor units', async () => {
    await deleteDatabase();
    await createLegacyDatabase();
    vi.resetModules();
    const { Database } = await import('../src/utils/database');
    const database = new Database();
    await database.init();
    database.setUserId('user-1');

    await expect(database.getProducts()).resolves.toEqual([
      expect.objectContaining({ id: 'legacy-product', priceMinor: 1999 }),
    ]);
  });
});
