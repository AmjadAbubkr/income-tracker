import { useState, useMemo } from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/currency';
import ExpenseForm from './ExpenseForm';
import { useLanguage } from '../context/LanguageContext';

interface ExpensesPageProps {
    expenses: Expense[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    onDeleteExpense: (id: string) => Promise<void>;
    currency: string;
}

export default function ExpensesPage({ expenses, onAddExpense, onDeleteExpense, currency }: ExpensesPageProps) {
    const { t } = useLanguage();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses]);

    return (
        <div className="expenses-page">
            <div className="page-header">
                <h1>{t.expenseHistory}</h1>
                <p className="page-subtitle">{t.expensesSubtitle}</p>
                <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
                    + {t.addExpense}
                </button>
            </div>

            {expenses.length === 0 ? (
                <div className="empty-state-card">
                    <p>{t.noExpensesYet}</p>
                </div>
            ) : (
                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>{t.date}</th>
                                <th>{t.description}</th>
                                <th>{t.category}</th>
                                <th>{t.amount}</th>
                                <th>{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenses.map((expense) => (
                                <tr key={expense.id}>
                                    <td>{expense.date}</td>
                                    <td>
                                        <strong>{expense.description}</strong>
                                    </td>
                                    <td>
                                        <span className="status-badge status-neutral">{expense.category}</span>
                                    </td>
                                    <td>{formatCurrency(expense.amount, currency)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(t.confirmDeleteExpense)) {
                                                        onDeleteExpense(expense.id);
                                                    }
                                                }}
                                                className="btn-table-edit"
                                                style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                                                title={t.delete}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{t.addExpense}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setIsFormOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <ExpenseForm
                                currency={currency}
                                onSubmit={async (data) => {
                                    await onAddExpense(data);
                                    setIsFormOpen(false);
                                }}
                                onCancel={() => setIsFormOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
