import { create } from 'zustand';
import { BusinessSubscription, CustomerSubscription } from '../types';
import type { IncomeEntry, Expense } from '../types';

interface SubscriptionState {
  business: BusinessSubscription[];
  customer: CustomerSubscription[];
  isLoading: boolean;
  fetch: () => Promise<void>;
  addBusiness: (sub: Omit<BusinessSubscription, 'id'>) => Promise<void>;
  updateBusiness: (id: string, sub: Omit<BusinessSubscription, 'id'>) => Promise<void>;
  removeBusiness: (id: string) => Promise<void>;
  addCustomer: (sub: Omit<CustomerSubscription, 'id'>) => Promise<void>;
  updateCustomer: (id: string, sub: Omit<CustomerSubscription, 'id'>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  /**
   * Evaluate all active subscriptions and generate any pending
   * expense/income entries. Returns the newly generated items.
   */
  processAutoRecording: () => Promise<{
    newExpenses: Expense[];
    newIncome: IncomeEntry[];
    updatedBusSubs: BusinessSubscription[];
    updatedCustSubs: CustomerSubscription[];
  }>;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  business: [],
  customer: [],
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    const { storage } = await import('../utils/storage');
    const [business, customer] = await Promise.all([
      storage.getBusinessSubscriptions(),
      storage.getCustomerSubscriptions(),
    ]);
    set({ business, customer, isLoading: false });
  },

  addBusiness: async (sub) => {
    const { storage } = await import('../utils/storage');
    const newSub: BusinessSubscription = { ...sub, id: crypto.randomUUID() };
    await storage.addBusinessSubscription(newSub);
    set({ business: [...get().business, newSub] });
  },

  updateBusiness: async (id, sub) => {
    const { storage } = await import('../utils/storage');
    const updatedSub = await storage.updateBusinessSubscription(id, sub);
    set({ business: get().business.map((current) => current.id === id ? updatedSub : current) });
  },

  removeBusiness: async (id) => {
    const { storage } = await import('../utils/storage');
    await storage.deleteBusinessSubscription(id);
    set({ business: get().business.filter((s) => s.id !== id) });
  },

  addCustomer: async (sub) => {
    const { storage } = await import('../utils/storage');
    const newSub: CustomerSubscription = { ...sub, id: crypto.randomUUID() };
    await storage.addCustomerSubscription(newSub);
    set({ customer: [...get().customer, newSub] });
  },

  updateCustomer: async (id, sub) => {
    const { storage } = await import('../utils/storage');
    const updatedSub = await storage.updateCustomerSubscription(id, sub);
    set({ customer: get().customer.map((current) => current.id === id ? updatedSub : current) });
  },

  removeCustomer: async (id) => {
    const { storage } = await import('../utils/storage');
    await storage.deleteCustomerSubscription(id);
    set({ customer: get().customer.filter((s) => s.id !== id) });
  },

  processAutoRecording: async () => {
    const { storage } = await import('../utils/storage');
    const result = await storage.processDueSubscriptions();
    set({ business: result.updatedBusSubs, customer: result.updatedCustSubs });
    return result;
  },
  clear: () => set({ business: [], customer: [], isLoading: false }),
}));
