import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription, User, Category } from '../types';
import { currencyStorage, parseMoneyInput } from './currency';
import { calculateNextBillingDate } from './dateUtils';

const DB_NAME = 'IncomeTrackerDB';
const DB_VERSION = 7;
const USERS_STORE = 'users';
const PRODUCTS_STORE = 'products';
const INCOME_STORE = 'income';
const EXPENSES_STORE = 'expenses';
const BUSINESS_SUBS_STORE = 'business_subscriptions';
const CUSTOMER_SUBS_STORE = 'customer_subscriptions';
const CATEGORIES_STORE = 'categories';

export type CheckoutItem = { productId: string; quantity: number };

export interface BackupCollections {
  products: Product[];
  incomeEntries: IncomeEntry[];
  expenses: Expense[];
  categories: Category[];
  businessSubscriptions: BusinessSubscription[];
  customerSubscriptions: CustomerSubscription[];
}

export interface CheckoutResult {
  entries: IncomeEntry[];
  products: Product[];
}

export interface SubscriptionProcessingResult {
  newExpenses: Expense[];
  newIncome: IncomeEntry[];
  updatedBusSubs: BusinessSubscription[];
  updatedCustSubs: CustomerSubscription[];
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month, 0)).getUTCDate() >= day
    && day >= 1
    && day <= 31
    && month >= 1
    && month <= 12;
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isSafeMinorUnit(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function validateBackupCollections(data: BackupCollections): void {
  if (!data || !Array.isArray(data.products) || !Array.isArray(data.incomeEntries)
    || !Array.isArray(data.expenses) || !Array.isArray(data.categories)
    || !Array.isArray(data.businessSubscriptions) || !Array.isArray(data.customerSubscriptions)) {
    throw new Error('Invalid backup');
  }

  const validateIds = (records: Array<{ id?: unknown }>) => {
    const ids = new Set<string>();
    records.forEach((record) => {
      if (typeof record.id !== 'string' || !record.id || ids.has(record.id)) throw new Error('Invalid backup');
      ids.add(record.id);
    });
  };

  validateIds(data.products);
  validateIds(data.incomeEntries);
  validateIds(data.expenses);
  validateIds(data.categories);
  validateIds(data.businessSubscriptions);
  validateIds(data.customerSubscriptions);

  data.products.forEach((product) => {
    if (typeof product.name !== 'string' || !isSafeMinorUnit(product.priceMinor)
      || (product.inventory !== undefined && (!Number.isSafeInteger(product.inventory) || product.inventory < 0))
      || !isIsoTimestamp(product.createdAt)) throw new Error('Invalid backup');
  });
  data.incomeEntries.forEach((entry) => {
    if (typeof entry.productId !== 'string' || !Number.isSafeInteger(entry.quantity) || entry.quantity <= 0
      || !isSafeMinorUnit(entry.amountMinor) || !isDateOnly(entry.date)) throw new Error('Invalid backup');
  });
  data.expenses.forEach((expense) => {
    if (typeof expense.category !== 'string' || typeof expense.description !== 'string'
      || !isSafeMinorUnit(expense.amountMinor) || !isDateOnly(expense.date)) throw new Error('Invalid backup');
  });
  data.categories.forEach((category) => {
    if (typeof category.name !== 'string' || !category.name.trim() || !isIsoTimestamp(category.createdAt)) {
      throw new Error('Invalid backup');
    }
  });

  const validCycles = new Set(['monthly', 'yearly']);
  const validBusinessStatuses = new Set(['active', 'paused', 'cancelled']);
  data.businessSubscriptions.forEach((sub) => {
    if (typeof sub.name !== 'string' || !isSafeMinorUnit(sub.amountMinor)
      || !validCycles.has(sub.billingCycle) || typeof sub.category !== 'string'
      || !isDateOnly(sub.nextBillingDate) || !validBusinessStatuses.has(sub.status)) throw new Error('Invalid backup');
  });
  const validCustomerStatuses = new Set(['active', 'expired', 'cancelled', 'pending']);
  data.customerSubscriptions.forEach((sub) => {
    if (typeof sub.customerName !== 'string' || typeof sub.serviceName !== 'string'
      || !isSafeMinorUnit(sub.amountMinor) || !validCycles.has(sub.billingCycle)
      || !isDateOnly(sub.startDate) || !isDateOnly(sub.nextBillingDate)
      || !validCustomerStatuses.has(sub.status)) throw new Error('Invalid backup');
  });
}

export class Database {
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

        if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
          const store = db.createObjectStore(CATEGORIES_STORE, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        } else {
          addUserIdIndex(CATEGORIES_STORE);
        }

        const migrateMoney = (storeName: string, legacyField: 'price' | 'amount', minorField: 'priceMinor' | 'amountMinor') => {
          if (!transaction || !db.objectStoreNames.contains(storeName)) return;
          const store = transaction.objectStore(storeName);
          const cursorRequest = store.openCursor();
          cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (!cursor) return;
            const record = cursor.value as Record<string, unknown>;
            if (typeof record[minorField] !== 'number' && typeof record[legacyField] === 'number') {
              const converted = parseMoneyInput(String(record[legacyField]), currencyStorage.getCurrency());
              if (converted === null) {
                transaction.abort();
                return;
              }
              record[minorField] = converted;
              delete record[legacyField];
              cursor.update(record);
            }
            cursor.continue();
          };
        };

        migrateMoney(PRODUCTS_STORE, 'price', 'priceMinor');
        migrateMoney(INCOME_STORE, 'amount', 'amountMinor');
        migrateMoney(EXPENSES_STORE, 'amount', 'amountMinor');
        migrateMoney(BUSINESS_SUBS_STORE, 'amount', 'amountMinor');
        migrateMoney(CUSTOMER_SUBS_STORE, 'amount', 'amountMinor');
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

  close(): void {
    this.db?.close();
    this.db = null;
    this.currentUserId = null;
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

  async getUserById(id: string): Promise<User | undefined> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USERS_STORE], 'readonly');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.get(id);
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

  // Get ALL items for the current user using their userId index
  private async getAllForUser<T>(storeName: string): Promise<T[]> {
    if (!this.currentUserId) return [];

    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      if (store.indexNames.contains('userId')) {
        const index = store.index('userId');
        const request = index.getAll(this.currentUserId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
      } else {
        // Fallback scan — should not happen if schema is correct
        const request = store.getAll();
        request.onsuccess = () => {
          const all: T[] = request.result || [];
          resolve(all.filter((item) => (item as Record<string, unknown>)['userId'] === this.currentUserId));
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  /**
   * Bulk-replace all items for the current user in a store.
   * Deletes all existing user-owned records, then inserts the new list.
   */
  private async saveAllForUser<T extends { id: string; userId?: string }>(storeName: string, items: T[]): Promise<void> {
    if (!this.currentUserId) throw new Error('No user logged in');

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
        keys.forEach((key) => {
          store.delete(key);
        });

        // 3. Add new items with userId attached
        items.forEach((item) => {
          store.add({ ...item, userId: this.currentUserId! });
        });
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Add a single item for the current user.
   * Automatically injects the currentUserId into the stored record.
   * Typed as Omit<T, 'userId'> so callers don't need to provide userId manually.
   */
  private async addOneForUser<T extends { userId?: string }>(
    storeName: string,
    item: Omit<T, 'userId'>
  ): Promise<void> {
    if (!this.currentUserId) throw new Error('No user logged in');
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({ ...item, userId: this.currentUserId });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async updateOneForUser<T extends { id: string; userId?: string }>(
    storeName: string,
    id: string,
    changes: Partial<Omit<T, 'id' | 'userId'>>
  ): Promise<T> {
    if (!this.currentUserId) throw new Error('No user logged in');
    const userId = this.currentUserId;
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      let updatedRecord: T | undefined;
      let settled = false;

      const fail = (error: unknown) => {
        if (!settled) {
          settled = true;
          reject(error instanceof Error ? error : new Error('Failed to update record'));
        }
      };

      const request = store.get(id);
      request.onerror = () => fail(request.error);
      request.onsuccess = () => {
        const existing = request.result as T | undefined;
        if (!existing || existing.userId !== userId) {
          fail(new Error('Record does not belong to the current user'));
          transaction.abort();
          return;
        }

        updatedRecord = { ...existing, ...changes, id, userId } as T;
        const updateRequest = store.put(updatedRecord);
        updateRequest.onerror = () => fail(updateRequest.error);
      };

      transaction.oncomplete = () => {
        if (!settled) {
          settled = true;
          resolve(updatedRecord!);
        }
      };
      transaction.onerror = () => fail(transaction.error);
      transaction.onabort = () => fail(transaction.error || new Error('Update transaction aborted'));
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
    return this.addOneForUser<Product>(PRODUCTS_STORE, product);
  }

  async updateProduct(id: string, changes: Partial<Omit<Product, 'id' | 'userId'>>): Promise<Product> {
    return this.updateOneForUser<Product>(PRODUCTS_STORE, id, changes);
  }

  async deleteProduct(id: string): Promise<void> {
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
    return this.addOneForUser<IncomeEntry>(INCOME_STORE, entry);
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
    return this.addOneForUser<Expense>(EXPENSES_STORE, expense);
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

  async addBusinessSubscription(sub: BusinessSubscription): Promise<void> {
    return this.addOneForUser<BusinessSubscription>(BUSINESS_SUBS_STORE, sub);
  }

  async updateBusinessSubscription(
    id: string,
    changes: Partial<Omit<BusinessSubscription, 'id' | 'userId'>>
  ): Promise<BusinessSubscription> {
    return this.updateOneForUser<BusinessSubscription>(BUSINESS_SUBS_STORE, id, changes);
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

  async addCustomerSubscription(sub: CustomerSubscription): Promise<void> {
    return this.addOneForUser<CustomerSubscription>(CUSTOMER_SUBS_STORE, sub);
  }

  async updateCustomerSubscription(
    id: string,
    changes: Partial<Omit<CustomerSubscription, 'id' | 'userId'>>
  ): Promise<CustomerSubscription> {
    return this.updateOneForUser<CustomerSubscription>(CUSTOMER_SUBS_STORE, id, changes);
  }

  async deleteCustomerSubscription(id: string): Promise<void> {
    return this.deleteItem(CUSTOMER_SUBS_STORE, id);
  }

  /* ── Categories ── */
  async getCategories(): Promise<Category[]> {
    return this.getAllForUser<Category>(CATEGORIES_STORE);
  }

  async addCategory(category: Category): Promise<void> {
    return this.addOneForUser<Category>(CATEGORIES_STORE, category);
  }

  async saveCategories(categories: Category[]): Promise<void> {
    return this.saveAllForUser(CATEGORIES_STORE, categories);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.deleteItem(CATEGORIES_STORE, id);
  }

  async checkout(items: CheckoutItem[], date: string, notes?: string): Promise<CheckoutResult> {
    if (!this.currentUserId) throw new Error('No user logged in');
    if (!isDateOnly(date)) throw new Error('Sale date must be an ISO date');
    if (items.length === 0) throw new Error('Checkout requires at least one item');

    const quantities = new Map<string, number>();
    for (const item of items) {
      if (!item.productId || !Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
        throw new Error('Checkout quantities must be positive integers');
      }
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    const userId = this.currentUserId;
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PRODUCTS_STORE, INCOME_STORE], 'readwrite');
      const productsStore = transaction.objectStore(PRODUCTS_STORE);
      const incomeStore = transaction.objectStore(INCOME_STORE);
      const products = new Map<string, Product | undefined>();
      let remaining = quantities.size;
      let result: CheckoutResult | undefined;
      let settled = false;

      const fail = (error: unknown) => {
        if (!settled) {
          settled = true;
          reject(error instanceof Error ? error : new Error('Checkout failed'));
        }
      };

      const finishReads = () => {
        try {
          const entries: IncomeEntry[] = [];
          const updatedProducts: Product[] = [];

          for (const [productId, quantity] of quantities) {
            const product = products.get(productId);
            if (!product || product.userId !== userId) {
              throw new Error('Product does not belong to the current user');
            }
            if (!isSafeMinorUnit(product.priceMinor)) {
              throw new Error('Product price is invalid');
            }
            if (product.inventory !== undefined &&
              (!Number.isSafeInteger(product.inventory) || product.inventory < quantity)) {
              throw new Error('Insufficient stock');
            }

            const amountMinor = product.priceMinor * quantity;
            if (!Number.isSafeInteger(amountMinor)) throw new Error('Sale amount is too large');

            const updatedProduct: Product = product.inventory === undefined
              ? product
              : { ...product, inventory: product.inventory - quantity };
            if (product.inventory !== undefined) productsStore.put(updatedProduct);
            updatedProducts.push(updatedProduct);

            entries.push({
              id: crypto.randomUUID(),
              userId,
              productId,
              quantity,
              amountMinor,
              date,
              notes: notes?.trim() || undefined,
            });
          }

          entries.forEach((entry) => incomeStore.add(entry));
          result = { entries, products: updatedProducts };
        } catch (error) {
          fail(error);
          transaction.abort();
        }
      };

      for (const productId of quantities.keys()) {
        const request = productsStore.get(productId);
        request.onerror = () => fail(request.error);
        request.onsuccess = () => {
          products.set(productId, request.result as Product | undefined);
          remaining -= 1;
          if (remaining === 0) finishReads();
        };
      }

      transaction.oncomplete = () => {
        if (!settled) {
          settled = true;
          resolve(result!);
        }
      };
      transaction.onerror = () => fail(transaction.error);
      transaction.onabort = () => fail(transaction.error || new Error('Checkout transaction aborted'));
    });
  }

  async processDueSubscriptions(asOfDate = new Date().toISOString().split('T')[0]!): Promise<SubscriptionProcessingResult> {
    if (!this.currentUserId) throw new Error('No user logged in');
    if (!isDateOnly(asOfDate)) throw new Error('Processing date must be an ISO date');

    const userId = this.currentUserId;
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [BUSINESS_SUBS_STORE, CUSTOMER_SUBS_STORE, EXPENSES_STORE, INCOME_STORE],
        'readwrite'
      );
      const businessStore = transaction.objectStore(BUSINESS_SUBS_STORE);
      const customerStore = transaction.objectStore(CUSTOMER_SUBS_STORE);
      const expensesStore = transaction.objectStore(EXPENSES_STORE);
      const incomeStore = transaction.objectStore(INCOME_STORE);
      let business: BusinessSubscription[] = [];
      let customer: CustomerSubscription[] = [];
      let pendingReads = 2;
      let result: SubscriptionProcessingResult | undefined;
      let settled = false;

      const fail = (error: unknown) => {
        if (!settled) {
          settled = true;
          reject(error instanceof Error ? error : new Error('Subscription processing failed'));
        }
      };

      const processRecords = () => {
        try {
          const newExpenses: Expense[] = [];
          const newIncome: IncomeEntry[] = [];
          const updatedBusSubs = business.map((sub) => ({ ...sub }));
          const updatedCustSubs = customer.map((sub) => ({ ...sub }));

          updatedBusSubs.forEach((sub) => {
            if (sub.userId !== userId || sub.status !== 'active' || !isDateOnly(sub.nextBillingDate) || sub.nextBillingDate > asOfDate) {
              return;
            }
            while (sub.nextBillingDate <= asOfDate) {
              newExpenses.push({
                id: crypto.randomUUID(),
                userId,
                amountMinor: sub.amountMinor,
                category: sub.category || 'Service',
                description: `Recurring: ${sub.name}`,
                date: sub.nextBillingDate,
              });
              const nextDate = calculateNextBillingDate(sub.nextBillingDate, sub.billingCycle);
              if (nextDate === sub.nextBillingDate) throw new Error('Subscription billing date cannot advance');
              sub.nextBillingDate = nextDate;
            }
            businessStore.put(sub);
          });

          updatedCustSubs.forEach((sub) => {
            if (sub.userId !== userId || sub.status !== 'active' || !isDateOnly(sub.nextBillingDate) || sub.nextBillingDate > asOfDate) {
              return;
            }
            while (sub.nextBillingDate <= asOfDate) {
              newIncome.push({
                id: crypto.randomUUID(),
                userId,
                productId: 'subscription',
                quantity: 1,
                amountMinor: sub.amountMinor,
                date: sub.nextBillingDate,
                notes: `Recurring: ${sub.serviceName} - ${sub.customerName}`,
              });
              const nextDate = calculateNextBillingDate(sub.nextBillingDate, sub.billingCycle);
              if (nextDate === sub.nextBillingDate) throw new Error('Subscription billing date cannot advance');
              sub.nextBillingDate = nextDate;
            }
            customerStore.put(sub);
          });

          newExpenses.forEach((expense) => expensesStore.add(expense));
          newIncome.forEach((entry) => incomeStore.add(entry));
          result = { newExpenses, newIncome, updatedBusSubs, updatedCustSubs };
        } catch (error) {
          fail(error);
          transaction.abort();
        }
      };

      const businessRequest = businessStore.index('userId').getAll(userId);
      businessRequest.onerror = () => fail(businessRequest.error);
      businessRequest.onsuccess = () => {
        business = businessRequest.result as BusinessSubscription[];
        pendingReads -= 1;
        if (pendingReads === 0) processRecords();
      };

      const customerRequest = customerStore.index('userId').getAll(userId);
      customerRequest.onerror = () => fail(customerRequest.error);
      customerRequest.onsuccess = () => {
        customer = customerRequest.result as CustomerSubscription[];
        pendingReads -= 1;
        if (pendingReads === 0) processRecords();
      };

      transaction.oncomplete = () => {
        if (!settled) {
          settled = true;
          resolve(result!);
        }
      };
      transaction.onerror = () => fail(transaction.error);
      transaction.onabort = () => fail(transaction.error || new Error('Subscription transaction aborted'));
    });
  }

  async restoreBackup(data: BackupCollections): Promise<void> {
    if (!this.currentUserId) throw new Error('No user logged in');
    validateBackupCollections(data);
    const userId = this.currentUserId;
    const db = await this.ensureDB();
    const storeNames = [
      PRODUCTS_STORE,
      INCOME_STORE,
      EXPENSES_STORE,
      CATEGORIES_STORE,
      BUSINESS_SUBS_STORE,
      CUSTOMER_SUBS_STORE,
    ];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, 'readwrite');
      const keysByStore = new Map<string, IDBValidKey[]>();
      let pendingReads = storeNames.length;
      let settled = false;

      const fail = (error: unknown) => {
        if (!settled) {
          settled = true;
          reject(error instanceof Error ? error : new Error('Backup restore failed'));
        }
      };

      const restoreRecords = () => {
        const recordsByStore: Record<string, Array<Record<string, unknown>>> = {
          [PRODUCTS_STORE]: data.products as unknown as Array<Record<string, unknown>>,
          [INCOME_STORE]: data.incomeEntries as unknown as Array<Record<string, unknown>>,
          [EXPENSES_STORE]: data.expenses as unknown as Array<Record<string, unknown>>,
          [CATEGORIES_STORE]: data.categories as unknown as Array<Record<string, unknown>>,
          [BUSINESS_SUBS_STORE]: data.businessSubscriptions as unknown as Array<Record<string, unknown>>,
          [CUSTOMER_SUBS_STORE]: data.customerSubscriptions as unknown as Array<Record<string, unknown>>,
        };

        storeNames.forEach((storeName) => {
          const store = transaction.objectStore(storeName);
          keysByStore.get(storeName)?.forEach((key) => store.delete(key));
          recordsByStore[storeName]!.forEach((record) => store.add({ ...record, userId }));
        });
      };

      storeNames.forEach((storeName) => {
        const store = transaction.objectStore(storeName);
        const request = store.index('userId').getAllKeys(userId);
        request.onerror = () => fail(request.error);
        request.onsuccess = () => {
          keysByStore.set(storeName, request.result);
          pendingReads -= 1;
          if (pendingReads === 0) restoreRecords();
        };
      });

      transaction.oncomplete = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      transaction.onerror = () => fail(transaction.error);
      transaction.onabort = () => fail(transaction.error || new Error('Backup restore transaction aborted'));
    });
  }

  /* ── Shared Helpers ── */
  async deleteItem(storeName: string, id: string): Promise<void> {
    if (!this.currentUserId) throw new Error('No user logged in');
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const record = request.result as { userId?: string } | undefined;
        if (!record || record.userId !== this.currentUserId) {
          transaction.abort();
          reject(new Error('Record does not belong to the current user'));
          return;
        }
        const deleteRequest = store.delete(id);
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const database = new Database();
