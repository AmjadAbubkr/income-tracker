import { create } from 'zustand';
import { Expense } from '../types';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  fetch: () => Promise<void>;
  add: (expense: Omit<Expense, 'id'>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    const { storage } = await import('../utils/storage');
    const expenses = await storage.getExpenses();
    set({ expenses, isLoading: false });
  },

  add: async (expense) => {
    const { storage } = await import('../utils/storage');
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    const updated = [...get().expenses, newExpense];
    await storage.saveExpenses(updated);
    set({ expenses: updated });
  },

  remove: async (id) => {
    const { storage } = await import('../utils/storage');
    await storage.deleteExpense(id);
    const updated = get().expenses.filter((e) => e.id !== id);
    set({ expenses: updated });
  },
  clear: () => set({ expenses: [], isLoading: false }),
}));
