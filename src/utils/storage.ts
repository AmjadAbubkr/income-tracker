import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription, User } from '../types';
import { database } from './database';

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

  async deleteCustomerSubscription(id: string): Promise<void> {
    return database.deleteCustomerSubscription(id);
  },
};
