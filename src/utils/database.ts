import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription, User } from '../types';

const DB_NAME = 'IncomeTrackerDB';
const DB_VERSION = 4;
const USERS_STORE = 'users'; // New store
const PRODUCTS_STORE = 'products';
const INCOME_STORE = 'income';
const EXPENSES_STORE = 'expenses';
const BUSINESS_SUBS_STORE = 'business_subscriptions';
const CUSTOMER_SUBS_STORE = 'customer_subscriptions';

class Database {
  private db: IDBDatabase | null = null;
  private currentUserId: string | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;

        // Create Users Store
        if (!db.objectStoreNames.contains(USERS_STORE)) {
          const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
        }

        // Helper to add userId index to existing stores
        const addUserIdIndex = (storeName: string) => {
          if (db.objectStoreNames.contains(storeName)) {
            const store = transaction?.objectStore(storeName);
            if (store && !store.indexNames.contains('userId')) {
              store.createIndex('userId', 'userId', { unique: false });
            }
          }
        };

        // Create/Update stores
        if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
          const store = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        } else {
          addUserIdIndex(PRODUCTS_STORE);
        }

        if (!db.objectStoreNames.contains(INCOME_STORE)) {
          const store = db.createObjectStore(INCOME_STORE, { keyPath: 'id' });
          store.createIndex('productId', 'productId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('amount', 'amount', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        } else {
          addUserIdIndex(INCOME_STORE);
        }

        if (!db.objectStoreNames.contains(EXPENSES_STORE)) {
          const store = db.createObjectStore(EXPENSES_STORE, { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        } else {
          addUserIdIndex(EXPENSES_STORE);
        }

        if (!db.objectStoreNames.contains(BUSINESS_SUBS_STORE)) {
          const store = db.createObjectStore(BUSINESS_SUBS_STORE, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('nextBillingDate', 'nextBillingDate', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        } else {
          addUserIdIndex(BUSINESS_SUBS_STORE);
        }

        if (!db.objectStoreNames.contains(CUSTOMER_SUBS_STORE)) {
          const store = db.createObjectStore(CUSTOMER_SUBS_STORE, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('customerName', 'customerName', { unique: false });
          store.createIndex('nextBillingDate', 'nextBillingDate', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        } else {
          addUserIdIndex(CUSTOMER_SUBS_STORE);
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database initialization failed');
    }
    return this.db;
  }

  /* ── User Management ── */
  setUserId(id: string | null) {
    this.currentUserId = id;
  }

  async createUser(user: User): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USERS_STORE], 'readwrite');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.add(user);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USERS_STORE], 'readonly');
      const store = transaction.objectStore(USERS_STORE);
      const index = store.index('email');
      const request = index.get(email);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateUser(user: User): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USERS_STORE], 'readwrite');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.put(user);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /* ── Generic Helpers for User-Isolated Data ── */

  // Helper to get ALL items for current user
  private async getAllForUser<T>(storeName: string): Promise<T[]> {
    if (!this.currentUserId) return [];

    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      // If index exists, use it
      if (store.indexNames.contains('userId')) {
        const index = store.index('userId');
        const request = index.getAll(this.currentUserId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
      } else {
        // Fallback (slow, shouldn't happen if schema is correct)
        const request = store.getAll();
        request.onsuccess = () => {
          const all = request.result || [];
          // @ts-ignore
          resolve(all.filter(item => item.userId === this.currentUserId));
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  // Helper to bulk save (replace) items for current user
  // This mimics the previous behavior of "save all", but scoped to user.
  private async saveAllForUser<T extends { id: string, userId?: string }>(storeName: string, items: T[]): Promise<void> {
    if (!this.currentUserId) throw new Error("No user logged in");

    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const userIdIndex = store.index('userId');

      // 1. Find all existing keys for this user
      const request = userIdIndex.getAllKeys(this.currentUserId);

      request.onsuccess = () => {
        const keys = request.result;

        // 2. Delete them
        keys.forEach(key => {
          store.delete(key);
        });

        // 3. Add new items with userId attached
        items.forEach(item => {
          store.add({ ...item, userId: this.currentUserId! });
        });
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Generic add with userId injection
  private async addOneForUser<T>(storeName: string, item: any): Promise<void> {
    if (!this.currentUserId) throw new Error("No user logged in");
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({ ...item, userId: this.currentUserId });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /* ── Products ── */
  async getProducts(): Promise<Product[]> {
    return this.getAllForUser<Product>(PRODUCTS_STORE);
  }

  async saveProducts(products: Product[]): Promise<void> {
    return this.saveAllForUser(PRODUCTS_STORE, products);
  }

  async addProduct(product: Product): Promise<void> {
    return this.addOneForUser(PRODUCTS_STORE, product);
  }

  async deleteProduct(id: string): Promise<void> {
    // We assume ID is unique enough, but could check userId
    return this.deleteItem(PRODUCTS_STORE, id);
  }

  /* ── Income ── */
  async getIncomeEntries(): Promise<IncomeEntry[]> {
    return this.getAllForUser<IncomeEntry>(INCOME_STORE);
  }

  async saveIncomeEntries(entries: IncomeEntry[]): Promise<void> {
    return this.saveAllForUser(INCOME_STORE, entries);
  }

  async addIncomeEntry(entry: IncomeEntry): Promise<void> {
    return this.addOneForUser(INCOME_STORE, entry);
  }

  async deleteIncomeEntry(id: string): Promise<void> {
    return this.deleteItem(INCOME_STORE, id);
  }

  /* ── Expenses ── */
  async getExpenses(): Promise<Expense[]> {
    return this.getAllForUser<Expense>(EXPENSES_STORE);
  }

  async saveExpenses(expenses: Expense[]): Promise<void> {
    return this.saveAllForUser(EXPENSES_STORE, expenses);
  }

  async addExpense(expense: Expense): Promise<void> {
    return this.addOneForUser(EXPENSES_STORE, expense);
  }

  async deleteExpense(id: string): Promise<void> {
    return this.deleteItem(EXPENSES_STORE, id);
  }

  /* ── Business Subscriptions ── */
  async getBusinessSubscriptions(): Promise<BusinessSubscription[]> {
    return this.getAllForUser<BusinessSubscription>(BUSINESS_SUBS_STORE);
  }

  async saveBusinessSubscriptions(subs: BusinessSubscription[]): Promise<void> {
    return this.saveAllForUser(BUSINESS_SUBS_STORE, subs);
  }

  async deleteBusinessSubscription(id: string): Promise<void> {
    return this.deleteItem(BUSINESS_SUBS_STORE, id);
  }

  /* ── Customer Subscriptions ── */
  async getCustomerSubscriptions(): Promise<CustomerSubscription[]> {
    return this.getAllForUser<CustomerSubscription>(CUSTOMER_SUBS_STORE);
  }

  async saveCustomerSubscriptions(subs: CustomerSubscription[]): Promise<void> {
    return this.saveAllForUser(CUSTOMER_SUBS_STORE, subs);
  }

  async deleteCustomerSubscription(id: string): Promise<void> {
    return this.deleteItem(CUSTOMER_SUBS_STORE, id);
  }

  /* ── Shared Helpers ── */
  async deleteItem(storeName: string, id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const database = new Database();

// Initialize database on import
database.init().catch(console.error);

