import { create } from 'zustand';
import { Expense } from '../types';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  fetch: () => Promise<void>;
  add: (expense: Omit<Expense, 'id'>) => Promise<void>;
  update: (id: string, changes: Partial<Omit<Expense, 'id' | 'userId'>>) => Promise<void>;
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
    await storage.addExpense(newExpense);
    set({ expenses: [...get().expenses, newExpense] });
  },

  update: async (id, changes) => {
    const { storage } = await import('../utils/storage');
    const updatedExpense = await storage.updateExpense(id, changes);
    set({ expenses: get().expenses.map((expense) => expense.id === id ? updatedExpense : expense) });
  },

  remove: async (id) => {
    const { storage } = await import('../utils/storage');
    await storage.deleteExpense(id);
    const updated = get().expenses.filter((e) => e.id !== id);
    set({ expenses: updated });
  },
  clear: () => set({ expenses: [], isLoading: false }),
}));
