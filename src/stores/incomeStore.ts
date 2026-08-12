import { create }  from 'zustand';
  import { IncomeEntry } from '../types';
  import { dailyStatsStorage } from '../utils/dailyStats';

  interface IncomeState {
    entries: IncomeEntry[];
    isLoading: boolean;
    fetch: () => Promise<void>;
    add: (entry: Omit<IncomeEntry, 'id'>) => Promise<void>;
    removeByProductId: (productId: string) => Promise<void>;
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
      const updated = [...get().entries, newEntry];
      await storage.saveIncomeEntries(updated);
      dailyStatsStorage.addSale(newEntry.amountMinor, newEntry.quantity);
      set({ entries: updated });
    },

    removeByProductId: async (productId) => {
      const { storage } = await import('../utils/storage');
      const updated = get().entries.filter((e) => e.productId !== productId);
      await storage.saveIncomeEntries(updated);
      set({ entries: updated });
    },
  }));
