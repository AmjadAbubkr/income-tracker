import { useState, FormEvent } from 'react';
import { Expense } from '../types';
import { formatMoneyInput, getCurrency, parseMoneyInput } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

interface ExpenseFormProps {
    onSubmit: (expense: Omit<Expense, 'id'>) => void | Promise<void>;
    onCancel?: () => void;
    currency: string;
    initialData?: Expense;
}

const CATEGORIES = [
    'Raw Materials',
    'Packaging',
    'Shipping',
    'Marketing',
    'Equipment',
    'Utilities',
    'Other',
];

export default function ExpenseForm({ onSubmit, onCancel, currency, initialData }: ExpenseFormProps) {
    const { t } = useLanguage();
    const currencyInfo = getCurrency(currency);
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData ? formatMoneyInput(initialData.amountMinor, currency) : '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!description.trim() || !amount.trim() || !date) {
            alert(t.fillRequiredFields);
            return;
        }

        const amountMinor = parseMoneyInput(amount, currency);
        if (amountMinor === null || amountMinor <= 0) {
            alert(t.validAmount);
            return;
        }

        const finalCategory = isCustomCategory ? customCategory : category;
        if (!finalCategory.trim()) {
            alert(t.selectOrEnterCategory);
            return;
        }

        try {
            await onSubmit({
                description: description.trim(),
                amountMinor,
                category: finalCategory,
                date,
            });

            // Reset form
            setDescription('');
            setAmount('');
            setCategory('');
            setCustomCategory('');
            setIsCustomCategory(false);
            setDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error('Error submitting expense:', error);
            alert(t.failedToSaveExpense);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="income-form">
            <h2>{initialData ? t.editExpense : t.recordExpense}</h2>

            <div className="form-group">
                <label htmlFor="description">{t.description} *</label>
                <input
                    id="description"
                    name="expenseDescription"
                    type="text"
                    autoComplete="off"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Monthly Hosting…"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="amount">{t.amount} ({currencyInfo.symbol}) *</label>
                <div className="price-input-wrapper">
                    <span className="price-symbol">{currencyInfo.symbol}</span>
                    <input
                        id="amount"
                        name="expenseAmount"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00…"
                        required
                        className="price-input"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="category">{t.category} *</label>
                {!isCustomCategory ? (
                    <select
                        id="category"
                        name="expenseCategory"
                        value={category}
                        onChange={(e) => {
                            if (e.target.value === 'custom') {
                                setIsCustomCategory(true);
                            } else {
                                setCategory(e.target.value);
                            }
                        }}
                        required
                    >
                        <option value="">{t.selectCategory}</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="custom">+ {t.addCustomCategory}</option>
                    </select>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            name="customCategory"
                            autoComplete="off"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder={`${t.enterCustomCategory}…`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setIsCustomCategory(false)}
                            className="btn-secondary"
                            style={{ padding: '0 12px' }}
                        >
                            {t.cancel}
                        </button>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="date">{t.date} *</label>
                <input
                    id="date"
                    name="expenseDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    {initialData ? t.updateExpense : t.saveExpense}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        {t.cancel}
                    </button>
                )}
            </div>
        </form>
    );
}
