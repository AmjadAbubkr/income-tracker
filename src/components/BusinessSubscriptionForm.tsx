import { useState } from 'react';
import { BusinessSubscription } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatMoneyInput, parseMoneyInput } from '../utils/currency';

interface BusinessSubscriptionFormProps {
    onSubmit: (sub: Omit<BusinessSubscription, 'id'>) => Promise<void>;
    onClose: () => void;
    initialData?: BusinessSubscription;
}

export default function BusinessSubscriptionForm({ onSubmit, onClose, initialData }: BusinessSubscriptionFormProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Omit<BusinessSubscription, 'id'>>({
        name: initialData?.name || '',
        amountMinor: initialData?.amountMinor || 0,
        billingCycle: initialData?.billingCycle || 'monthly',
        category: initialData?.category || 'Service',
        nextBillingDate: initialData?.nextBillingDate || new Date().toISOString().split('T')[0],
        status: initialData?.status || 'active',
    });
    const [amount, setAmount] = useState(initialData ? formatMoneyInput(initialData.amountMinor) : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountMinor = parseMoneyInput(amount);
        if (!formData.name || amountMinor === null || amountMinor <= 0) {
            alert(t.fillRequiredFields);
            return;
        }
        onSubmit({ ...formData, amountMinor });
    };

    return (
        <form onSubmit={handleSubmit} className="income-form">
            <div className="form-group">
                <label htmlFor="biz-sub-name">{t.description} *</label>
                <input
                    id="biz-sub-name"
                    name="bizSubName"
                    type="text"
                    autoComplete="off"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. GitHub, Netflix, Hosting"
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="biz-sub-amount">{t.amount} *</label>
                    <input
                        id="biz-sub-amount"
                        name="bizSubAmount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="biz-sub-cycle">{t.billingCycle}</label>
                    <select
                        id="biz-sub-cycle"
                        name="bizSubCycle"
                        value={formData.billingCycle}
                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as BusinessSubscription['billingCycle'] })}
                    >
                        <option value="monthly">{t.monthly}</option>
                        <option value="yearly">{t.yearly}</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="biz-sub-category">{t.category}</label>
                <input
                    id="biz-sub-category"
                    name="bizSubCategory"
                    type="text"
                    autoComplete="off"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Tools, Hosting"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="biz-sub-next-date">{t.nextBillingDate}</label>
                    <input
                        id="biz-sub-next-date"
                        name="bizSubNextDate"
                        type="date"
                        autoComplete="off"
                        value={formData.nextBillingDate}
                        onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="biz-sub-status">{t.status}</label>
                    <select
                        id="biz-sub-status"
                        name="bizSubStatus"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as BusinessSubscription['status'] })}
                    >
                        <option value="active">{t.active}</option>
                        <option value="paused">{t.paused}</option>
                        <option value="cancelled">{t.cancelled}</option>
                    </select>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                    {t.cancel}
                </button>
                <button type="submit" className="btn btn-primary">
                    {initialData ? t.edit : t.confirm}
                </button>
            </div>
        </form>
    );
}
