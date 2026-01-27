import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription } from '../types';

const DB_NAME = 'IncomeTrackerDB';
const DB_VERSION = 3;
const PRODUCTS_STORE = 'products';
const INCOME_STORE = 'income';
const EXPENSES_STORE = 'expenses';
const BUSINESS_SUBS_STORE = 'business_subscriptions';
const CUSTOMER_SUBS_STORE = 'customer_subscriptions';

class Database {
  private db: IDBDatabase | null = null;

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

        // Create products store if it doesn't exist
        if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
          const productsStore = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
          productsStore.createIndex('name', 'name', { unique: false });
          productsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create income store if it doesn't exist
        if (!db.objectStoreNames.contains(INCOME_STORE)) {
          const incomeStore = db.createObjectStore(INCOME_STORE, { keyPath: 'id' });
          incomeStore.createIndex('productId', 'productId', { unique: false });
          incomeStore.createIndex('date', 'date', { unique: false });
          incomeStore.createIndex('amount', 'amount', { unique: false });
        }

        // Create expenses store if it doesn't exist
        if (!db.objectStoreNames.contains(EXPENSES_STORE)) {
          const expensesStore = db.createObjectStore(EXPENSES_STORE, { keyPath: 'id' });
          expensesStore.createIndex('category', 'category', { unique: false });
          expensesStore.createIndex('date', 'date', { unique: false });
        }

        // Create business subscriptions store
        if (!db.objectStoreNames.contains(BUSINESS_SUBS_STORE)) {
          const businessStore = db.createObjectStore(BUSINESS_SUBS_STORE, { keyPath: 'id' });
          businessStore.createIndex('status', 'status', { unique: false });
          businessStore.createIndex('nextBillingDate', 'nextBillingDate', { unique: false });
        }

        // Create customer subscriptions store
        if (!db.objectStoreNames.contains(CUSTOMER_SUBS_STORE)) {
          const customerStore = db.createObjectStore(CUSTOMER_SUBS_STORE, { keyPath: 'id' });
          customerStore.createIndex('status', 'status', { unique: false });
          customerStore.createIndex('customerName', 'customerName', { unique: false });
          customerStore.createIndex('nextBillingDate', 'nextBillingDate', { unique: false });
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

  // Products methods
  async getProducts(): Promise<Product[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PRODUCTS_STORE], 'readonly');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async saveProducts(products: Product[]): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PRODUCTS_STORE], 'readwrite');
      const store = transaction.objectStore(PRODUCTS_STORE);

      // Clear existing products
      store.clear();

      // Add all products
      products.forEach((product) => {
        store.add(product);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteBusinessSubscription(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BUSINESS_SUBS_STORE], 'readwrite');
      const store = transaction.objectStore(BUSINESS_SUBS_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async addProduct(product: Product): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PRODUCTS_STORE], 'readwrite');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const request = store.add(product);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteProduct(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PRODUCTS_STORE], 'readwrite');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Income methods
  async getIncomeEntries(): Promise<IncomeEntry[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INCOME_STORE], 'readonly');
      const store = transaction.objectStore(INCOME_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async saveIncomeEntries(entries: IncomeEntry[]): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INCOME_STORE], 'readwrite');
      const store = transaction.objectStore(INCOME_STORE);

      // Clear existing entries
      store.clear();

      // Add all entries
      entries.forEach((entry) => {
        store.add(entry);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async addIncomeEntry(entry: IncomeEntry): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INCOME_STORE], 'readwrite');
      const store = transaction.objectStore(INCOME_STORE);
      const request = store.add(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteIncomeEntry(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INCOME_STORE], 'readwrite');
      const store = transaction.objectStore(INCOME_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getIncomeByDateRange(startDate: string, endDate: string): Promise<IncomeEntry[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INCOME_STORE], 'readonly');
      const store = transaction.objectStore(INCOME_STORE);
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EXPENSES_STORE], 'readonly');
      const store = transaction.objectStore(EXPENSES_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async saveExpenses(expenses: Expense[]): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EXPENSES_STORE], 'readwrite');
      const store = transaction.objectStore(EXPENSES_STORE);

      store.clear();
      expenses.forEach((expense) => {
        store.add(expense);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async addExpense(expense: Expense): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EXPENSES_STORE], 'readwrite');
      const store = transaction.objectStore(EXPENSES_STORE);
      const request = store.add(expense);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteExpense(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EXPENSES_STORE], 'readwrite');
      const store = transaction.objectStore(EXPENSES_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Business Subscription methods
  async getBusinessSubscriptions(): Promise<BusinessSubscription[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BUSINESS_SUBS_STORE], 'readonly');
      const store = transaction.objectStore(BUSINESS_SUBS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async saveBusinessSubscriptions(subs: BusinessSubscription[]): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BUSINESS_SUBS_STORE], 'readwrite');
      const store = transaction.objectStore(BUSINESS_SUBS_STORE);

      store.clear();
      subs.forEach((sub) => {
        store.add(sub);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Customer Subscription methods
  async getCustomerSubscriptions(): Promise<CustomerSubscription[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CUSTOMER_SUBS_STORE], 'readonly');
      const store = transaction.objectStore(CUSTOMER_SUBS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async saveCustomerSubscriptions(subs: CustomerSubscription[]): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CUSTOMER_SUBS_STORE], 'readwrite');
      const store = transaction.objectStore(CUSTOMER_SUBS_STORE);

      store.clear();
      subs.forEach((sub) => {
        store.add(sub);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteCustomerSubscription(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CUSTOMER_SUBS_STORE], 'readwrite');
      const store = transaction.objectStore(CUSTOMER_SUBS_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const database = new Database();

// Initialize database on import
database.init().catch(console.error);

