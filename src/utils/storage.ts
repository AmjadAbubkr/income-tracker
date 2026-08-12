import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription, User, Category } from '../types';
import { database, BackupCollections, CheckoutItem, CheckoutResult, SubscriptionProcessingResult } from './database';

export const storage = {
  // Auth & Context
  setUserId(id: string | null) {
    database.setUserId(id);
  },

  auth: {
    async createUser(user: User): Promise<void> {
      return database.createUser(user);
    },
    async getUserByEmail(email: string): Promise<User | undefined> {
      return database.getUserByEmail(email);
    },
    async getUserById(id: string): Promise<User | undefined> {
      return database.getUserById(id);
    },
    async updateUser(user: User): Promise<void> {
      return database.updateUser(user);
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    return database.getProducts();
  },

  async saveProducts(products: Product[]): Promise<void> {
    return database.saveProducts(products);
  },

  async addProduct(product: Product): Promise<void> {
    return database.addProduct(product);
  },

  async updateProduct(id: string, changes: Partial<Omit<Product, 'id' | 'userId'>>): Promise<Product> {
    return database.updateProduct(id, changes);
  },

  async deleteProduct(id: string): Promise<void> {
    return database.deleteProduct(id);
  },

  // Income
  async getIncomeEntries(): Promise<IncomeEntry[]> {
    return database.getIncomeEntries();
  },

  async saveIncomeEntries(entries: IncomeEntry[]): Promise<void> {
    return database.saveIncomeEntries(entries);
  },

  async addIncomeEntry(entry: IncomeEntry): Promise<void> {
    return database.addIncomeEntry(entry);
  },

  async updateIncomeEntry(
    id: string,
    changes: Partial<Omit<IncomeEntry, 'id' | 'userId'>>
  ): Promise<IncomeEntry> {
    return database.updateIncomeEntry(id, changes);
  },

  async deleteIncomeEntry(id: string): Promise<void> {
    return database.deleteIncomeEntry(id);
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return database.getExpenses();
  },

  async saveExpenses(expenses: Expense[]): Promise<void> {
    return database.saveExpenses(expenses);
  },

  async addExpense(expense: Expense): Promise<void> {
    return database.addExpense(expense);
  },

  async updateExpense(
    id: string,
    changes: Partial<Omit<Expense, 'id' | 'userId'>>
  ): Promise<Expense> {
    return database.updateExpense(id, changes);
  },

  async deleteExpense(id: string): Promise<void> {
    return database.deleteExpense(id);
  },

  // Business Subscriptions
  async getBusinessSubscriptions(): Promise<BusinessSubscription[]> {
    return database.getBusinessSubscriptions();
  },

  async saveBusinessSubscriptions(subs: BusinessSubscription[]): Promise<void> {
    return database.saveBusinessSubscriptions(subs);
  },

  async addBusinessSubscription(sub: BusinessSubscription): Promise<void> {
    return database.addBusinessSubscription(sub);
  },

  async updateBusinessSubscription(
    id: string,
    changes: Partial<Omit<BusinessSubscription, 'id' | 'userId'>>
  ): Promise<BusinessSubscription> {
    return database.updateBusinessSubscription(id, changes);
  },

  async deleteBusinessSubscription(id: string): Promise<void> {
    return database.deleteBusinessSubscription(id);
  },

  // Customer Subscriptions
  async getCustomerSubscriptions(): Promise<CustomerSubscription[]> {
    return database.getCustomerSubscriptions();
  },

  async saveCustomerSubscriptions(subs: CustomerSubscription[]): Promise<void> {
    return database.saveCustomerSubscriptions(subs);
  },

  async addCustomerSubscription(sub: CustomerSubscription): Promise<void> {
    return database.addCustomerSubscription(sub);
  },

  async updateCustomerSubscription(
    id: string,
    changes: Partial<Omit<CustomerSubscription, 'id' | 'userId'>>
  ): Promise<CustomerSubscription> {
    return database.updateCustomerSubscription(id, changes);
  },

  async deleteCustomerSubscription(id: string): Promise<void> {
    return database.deleteCustomerSubscription(id);
  },

  async checkout(items: CheckoutItem[], date: string, notes?: string): Promise<CheckoutResult> {
    return database.checkout(items, date, notes);
  },

  async processDueSubscriptions(asOfDate?: string): Promise<SubscriptionProcessingResult> {
    return database.processDueSubscriptions(asOfDate);
  },

  async restoreBackup(data: BackupCollections): Promise<void> {
    return database.restoreBackup(data);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return database.getCategories();
  },

  async addCategory(category: Category): Promise<void> {
    return database.addCategory(category);
  },

  async saveCategories(categories: Category[]): Promise<void> {
    return database.saveCategories(categories);
  },

  async deleteCategory(id: string): Promise<void> {
    return database.deleteCategory(id);
  },
};
