import { useState, useMemo } from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/currency';
import ExpenseForm from './ExpenseForm';
import { useLanguage } from '../context/LanguageContext';
import { useExpenseStore } from '../stores/expenseStore';

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

interface ExpensesPageProps {
    currency: string;
}

export default function ExpensesPage({ currency }: ExpensesPageProps) {
    const { t } = useLanguage();
    const expenseStore = useExpenseStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [historyDate, setHistoryDate] = useState('');
    const [historyCategory, setHistoryCategory] = useState('');

    const categories = useMemo(() => {
        return Array.from(new Set(expenseStore.expenses.map((expense) => expense.category))).sort();
    }, [expenseStore.expenses]);

    const sortedExpenses = useMemo(() => {
        return [...expenseStore.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenseStore.expenses]);

    const filteredExpenses = useMemo(() => {
        return sortedExpenses.filter((expense) =>
            (!historyDate || expense.date === historyDate)
            && (!historyCategory || expense.category === historyCategory)
        );
    }, [historyCategory, historyDate, sortedExpenses]);

    const handleDelete = async (id: string) => {
        if (window.confirm(t.confirmDeleteExpense)) {
            try {
                await expenseStore.remove(id);
            } catch (error) {
                alert(error instanceof Error ? error.message : t.failedToDeleteExpense);
            }
        }
    };

    return (
        <div className="expenses-page">
            <div className="page-header">
                <h1>{t.expenses}</h1>
                <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
                    {t.addExpense}
                </button>
            </div>

            <div className="expenses-list">
                <div className="history-filters">
                    <label>
                        {t.date}
                        <input type="date" value={historyDate} onChange={(event) => setHistoryDate(event.target.value)} />
                    </label>
                    <label>
                        {t.category}
                        <select value={historyCategory} onChange={(event) => setHistoryCategory(event.target.value)}>
                            <option value="">{t.allCategories}</option>
                            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                    </label>
                </div>

                {filteredExpenses.length === 0 ? (
                    <p>{t.noExpensesYet}</p>
                ) : (
                    filteredExpenses.map((expense) => (
                        <div key={expense.id} className="expense-item">
                            <div className="expense-info">
                                <h3>{expense.description}</h3>
                                <p>{expense.category} - {expense.date}</p>
                            </div>
                            <div className="expense-actions">
                                <span className="expense-amount">{formatCurrency(expense.amountMinor, currency)}</span>
                                <button type="button" onClick={() => setEditingExpense(expense)} aria-label={t.editExpense}>
                                    {t.edit}
                                </button>
                                <button type="button" onClick={() => handleDelete(expense.id)} aria-label={t.deleteExpense}>
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {(isFormOpen || editingExpense) && (
                <ExpenseForm
                    onCancel={() => {
                        setIsFormOpen(false);
                        setEditingExpense(null);
                    }}
                    currency={currency}
                    initialData={editingExpense || undefined}
                    onSubmit={async (data) => {
                        if (editingExpense) {
                            await expenseStore.update(editingExpense.id, data);
                            setEditingExpense(null);
                        } else {
                            await expenseStore.add(data);
                            setIsFormOpen(false);
                        }
                    }}
                />
            )}
        </div>
    );
}
