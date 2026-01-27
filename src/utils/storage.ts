import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription } from '../types';
import { database } from './database';

const PRODUCTS_KEY = 'income-tracker-products';
const INCOME_KEY = 'income-tracker-income';
const EXPENSES_KEY = 'income-tracker-expenses';
const BUSINESS_SUBS_KEY = 'income-tracker-business-subs';
const CUSTOMER_SUBS_KEY = 'income-tracker-customer-subs';
const MIGRATED_KEY = 'income-tracker-migrated';
const MIGRATION_VERSION_KEY = 'income-tracker-migration-version';
const CURRENT_MIGRATION_VERSION = 2;

// Migration function to move from localStorage to IndexedDB
async function migrateFromLocalStorage(): Promise<void> {
  const migrationVersionRaw = localStorage.getItem(MIGRATION_VERSION_KEY);
  let migrationVersion = migrationVersionRaw ? parseInt(migrationVersionRaw, 10) : 0;

  if (!Number.isFinite(migrationVersion)) {
    migrationVersion = 0;
  }

  if (migrationVersion === 0 && localStorage.getItem(MIGRATED_KEY) === 'true') {
    migrationVersion = 1;
  }

  if (migrationVersion >= CURRENT_MIGRATION_VERSION) {
    return;
  }

  try {
    if (migrationVersion < 1) {
      const productsData = localStorage.getItem(PRODUCTS_KEY);
      if (productsData) {
        const products: Product[] = JSON.parse(productsData);
        if (products.length > 0) {
          await database.saveProducts(products);
        }
      }

      const incomeData = localStorage.getItem(INCOME_KEY);
      if (incomeData) {
        const entries: IncomeEntry[] = JSON.parse(incomeData);
        if (entries.length > 0) {
          await database.saveIncomeEntries(entries);
        }
      }

      const expensesData = localStorage.getItem(EXPENSES_KEY);
      if (expensesData) {
        const expenses: Expense[] = JSON.parse(expensesData);
        if (expenses.length > 0) {
          await database.saveExpenses(expenses);
        }
      }
    }

    if (migrationVersion < 2) {
      const businessSubsData = localStorage.getItem(BUSINESS_SUBS_KEY);
      if (businessSubsData) {
        const subs: BusinessSubscription[] = JSON.parse(businessSubsData);
        if (subs.length > 0) {
          await database.saveBusinessSubscriptions(subs);
        }
      }

      const customerSubsData = localStorage.getItem(CUSTOMER_SUBS_KEY);
      if (customerSubsData) {
        const subs: CustomerSubscription[] = JSON.parse(customerSubsData);
        if (subs.length > 0) {
          await database.saveCustomerSubscriptions(subs);
        }
      }
    }

    localStorage.setItem(MIGRATED_KEY, 'true');
    localStorage.setItem(MIGRATION_VERSION_KEY, String(CURRENT_MIGRATION_VERSION));
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Initialize database and migrate on first load
database.init().then(() => {
  migrateFromLocalStorage();
}).catch(console.error);

export const storage = {
  async getProducts(): Promise<Product[]> {
    try {
      await database.init();
      return await database.getProducts();
    } catch (error) {
      console.error('Error getting products:', error);
      const data = localStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveProducts(products: Product[]): Promise<void> {
    try {
      await database.init();
      await database.saveProducts(products);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products:', error);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    }
  },

  async getIncomeEntries(): Promise<IncomeEntry[]> {
    try {
      await database.init();
      return await database.getIncomeEntries();
    } catch (error) {
      console.error('Error getting income entries:', error);
      const data = localStorage.getItem(INCOME_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveIncomeEntries(entries: IncomeEntry[]): Promise<void> {
    try {
      await database.init();
      await database.saveIncomeEntries(entries);
      localStorage.setItem(INCOME_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving income entries:', error);
      localStorage.setItem(INCOME_KEY, JSON.stringify(entries));
    }
  },

  async addIncomeEntry(entry: IncomeEntry): Promise<void> {
    try {
      await database.init();
      await database.addIncomeEntry(entry);
      // Update localStorage backup
      const entries = await this.getIncomeEntries();
      localStorage.setItem(INCOME_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error adding income entry:', error);
      // Fallback to localStorage
      const entries = await this.getIncomeEntries();
      entries.push(entry);
      localStorage.setItem(INCOME_KEY, JSON.stringify(entries));
    }
  },

  async getExpenses(): Promise<Expense[]> {
    try {
      await database.init();
      return await database.getExpenses();
    } catch (error) {
      console.error('Error getting expenses:', error);
      const data = localStorage.getItem(EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      await database.init();
      await database.saveExpenses(expenses);
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    }
  },

  async addExpense(expense: Expense): Promise<void> {
    try {
      await database.init();
      await database.addExpense(expense);
      const expenses = await this.getExpenses();
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error adding expense:', error);
      const expenses = await this.getExpenses();
      expenses.push(expense);
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    }
  },

  async getBusinessSubscriptions(): Promise<BusinessSubscription[]> {
    try {
      await database.init();
      return await database.getBusinessSubscriptions();
    } catch (error) {
      console.error('Error getting business subscriptions:', error);
      const data = localStorage.getItem(BUSINESS_SUBS_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveBusinessSubscriptions(subs: BusinessSubscription[]): Promise<void> {
    try {
      await database.init();
      await database.saveBusinessSubscriptions(subs);
      localStorage.setItem(BUSINESS_SUBS_KEY, JSON.stringify(subs));
    } catch (error) {
      console.error('Error saving business subscriptions:', error);
      localStorage.setItem(BUSINESS_SUBS_KEY, JSON.stringify(subs));
    }
  },

  async getCustomerSubscriptions(): Promise<CustomerSubscription[]> {
    try {
      await database.init();
      return await database.getCustomerSubscriptions();
    } catch (error) {
      console.error('Error getting customer subscriptions:', error);
      const data = localStorage.getItem(CUSTOMER_SUBS_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveCustomerSubscriptions(subs: CustomerSubscription[]): Promise<void> {
    try {
      await database.init();
      await database.saveCustomerSubscriptions(subs);
      localStorage.setItem(CUSTOMER_SUBS_KEY, JSON.stringify(subs));
    } catch (error) {
      console.error('Error saving customer subscriptions:', error);
      localStorage.setItem(CUSTOMER_SUBS_KEY, JSON.stringify(subs));
    }
  },
};
