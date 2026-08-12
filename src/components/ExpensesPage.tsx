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

    const sortedExpenses = useMemo(() => {
        return [...expenseStore.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenseStore.expenses]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            await expenseStore.remove(id);
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
                {sortedExpenses.length === 0 ? (
                    <p>{t.noExpensesYet}</p>
                ) : (
                    sortedExpenses.map((expense) => (
                        <div key={expense.id} className="expense-item">
                            <div className="expense-info">
                                <h3>{expense.description}</h3>
                                <p>{expense.category} - {expense.date}</p>
                            </div>
                            <div className="expense-actions">
                                <span className="expense-amount">{formatCurrency(expense.amountMinor, currency)}</span>
                                <button onClick={() => handleDelete(expense.id)} aria-label="Delete expense">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isFormOpen && (
                <ExpenseForm
                    onCancel={() => setIsFormOpen(false)}
                    currency={currency}
                    onSubmit={async (data) => {
                        await expenseStore.add(data);
                        setIsFormOpen(false);
                    }}
                />
            )}
        </div>
    );
}
