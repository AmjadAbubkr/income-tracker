import { create } from 'zustand';
import { BusinessSubscription, CustomerSubscription } from '../types';
import { calculateNextBillingDate } from '../utils/dateUtils';
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
    const updated = [...get().business, newSub];
    await storage.saveBusinessSubscriptions(updated);
    set({ business: updated });
  },

  updateBusiness: async (id, sub) => {
    const { storage } = await import('../utils/storage');
    const updated = get().business.map((s) => (s.id === id ? { ...sub, id } : s));
    await storage.saveBusinessSubscriptions(updated);
    set({ business: updated });
  },

  removeBusiness: async (id) => {
    const { storage } = await import('../utils/storage');
    const updated = get().business.filter((s) => s.id !== id);
    await storage.saveBusinessSubscriptions(updated);
    set({ business: updated });
  },

  addCustomer: async (sub) => {
    const { storage } = await import('../utils/storage');
    const newSub: CustomerSubscription = { ...sub, id: crypto.randomUUID() };
    const updated = [...get().customer, newSub];
    await storage.saveCustomerSubscriptions(updated);
    set({ customer: updated });
  },

  updateCustomer: async (id, sub) => {
    const { storage } = await import('../utils/storage');
    const updated = get().customer.map((s) => (s.id === id ? { ...sub, id } : s));
    await storage.saveCustomerSubscriptions(updated);
    set({ customer: updated });
  },

  removeCustomer: async (id) => {
    const { storage } = await import('../utils/storage');
    const updated = get().customer.filter((s) => s.id !== id);
    await storage.saveCustomerSubscriptions(updated);
    set({ customer: updated });
  },

  processAutoRecording: async () => {
    const today = new Date().toISOString().split('T')[0];
    const newExpenses: Expense[] = [];
    const newIncome: IncomeEntry[] = [];
    let hasChanges = false;

    const updatedBusSubs = get().business.map((sub) => {
      if (sub.status !== 'active' || sub.nextBillingDate === '' || sub.nextBillingDate > today) {
        return sub;
      }
      let currentSub = { ...sub };
      let changed = false;
      while (currentSub.nextBillingDate <= today) {
        newExpenses.push({
          id: crypto.randomUUID(),
          amountMinor: currentSub.amountMinor,
          category: currentSub.category || 'Service',
          description: `Recurring: ${currentSub.name}`,
          date: currentSub.nextBillingDate,
        } as Expense);
        currentSub.nextBillingDate = calculateNextBillingDate(currentSub.nextBillingDate, currentSub.billingCycle);
        changed = true;
      }
      if (changed) hasChanges = true;
      return currentSub;
    });

    const updatedCustSubs = get().customer.map((sub) => {
      if (sub.status !== 'active' || sub.nextBillingDate === '' || sub.nextBillingDate > today) {
        return sub;
      }
      let currentSub = { ...sub };
      let changed = false;
      while (currentSub.nextBillingDate <= today) {
        newIncome.push({
          id: crypto.randomUUID(),
          productId: 'subscription',
          quantity: 1,
          amountMinor: currentSub.amountMinor,
          date: currentSub.nextBillingDate,
          notes: `Recurring: ${currentSub.serviceName} - ${currentSub.customerName}`,
        } as IncomeEntry);
        currentSub.nextBillingDate = calculateNextBillingDate(currentSub.nextBillingDate, currentSub.billingCycle);
        changed = true;
      }
      if (changed) hasChanges = true;
      return currentSub;
    });

    if (hasChanges) {
      const { storage } = await import('../utils/storage');
      await storage.saveBusinessSubscriptions(updatedBusSubs);
      await storage.saveCustomerSubscriptions(updatedCustSubs);
      set({ business: updatedBusSubs, customer: updatedCustSubs });
    }

    return { newExpenses, newIncome, updatedBusSubs, updatedCustSubs };
  },
}));
