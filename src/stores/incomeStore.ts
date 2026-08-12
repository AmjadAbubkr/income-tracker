import { create }  from 'zustand';
  import { IncomeEntry } from '../types';
  import { dailyStatsStorage } from '../utils/dailyStats';

  interface IncomeState {
    entries: IncomeEntry[];
    isLoading: boolean;
  fetch: () => Promise<void>;
  add: (entry: Omit<IncomeEntry, 'id'>) => Promise<void>;
  checkout: (items: Array<{ productId: string; quantity: number }>, date: string, notes?: string) => Promise<void>;
  update: (id: string, changes: Partial<Omit<IncomeEntry, 'id' | 'userId'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  removeByProductId: (productId: string) => Promise<void>;
    clear: () => void;
    dailyStats: {
      totalSales: number;
      totalRevenue: number;
      totalItems: number;
    };
  }

  export const useIncomeStore = create<IncomeState>((set, get) => ({
    entries: [],
    isLoading: false,
    dailyStats: { totalSales: 0, totalRevenue: 0, totalItems: 0 },

    fetch: async () => {
      set({ isLoading: true });
      const { storage } = await import('../utils/storage');
      const entries = await storage.getIncomeEntries();
      set({ entries, isLoading: false });
    },

    add: async (entry) => {
      const { storage } = await import('../utils/storage');
      const newEntry: IncomeEntry = { ...entry, id: crypto.randomUUID() };
      await storage.addIncomeEntry(newEntry);
      dailyStatsStorage.addSale(newEntry.amountMinor, newEntry.quantity);
      set({ entries: [...get().entries, newEntry] });
    },

  checkout: async (items, date, notes) => {
      const { storage } = await import('../utils/storage');
      const result = await storage.checkout(items, date, notes);
      result.entries.forEach((entry) => dailyStatsStorage.addSale(entry.amountMinor, entry.quantity));
      set({ entries: [...get().entries, ...result.entries] });
    },

    update: async (id, changes) => {
      const { storage } = await import('../utils/storage');
      const updatedEntry = await storage.updateIncomeEntry(id, changes);
      set({ entries: get().entries.map((entry) => entry.id === id ? updatedEntry : entry) });
    },

    remove: async (id) => {
      const { storage } = await import('../utils/storage');
      await storage.deleteIncomeEntry(id);
      set({ entries: get().entries.filter((entry) => entry.id !== id) });
    },

    removeByProductId: async (productId) => {
      const { storage } = await import('../utils/storage');
      const removed = get().entries.filter((e) => e.productId === productId);
      for (const entry of removed) {
        await storage.deleteIncomeEntry(entry.id);
      }
      const updated = get().entries.filter((e) => e.productId !== productId);
      set({ entries: updated });
    },
    clear: () => set({ entries: [], isLoading: false, dailyStats: { totalSales: 0, totalRevenue: 0, totalItems: 0 } }),
  }));
