import { useState } from 'react';
import { BusinessSubscription } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BusinessSubscriptionFormProps {
    onSubmit: (sub: Omit<BusinessSubscription, 'id'>) => Promise<void>;
    onClose: () => void;
    initialData?: BusinessSubscription;
}

export default function BusinessSubscriptionForm({ onSubmit, onClose, initialData }: BusinessSubscriptionFormProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Omit<BusinessSubscription, 'id'>>({
        name: initialData?.name || '',
        amount: initialData?.amount || 0,
        billingCycle: initialData?.billingCycle || 'monthly',
        category: initialData?.category || 'Service',
        nextBillingDate: initialData?.nextBillingDate || new Date().toISOString().split('T')[0],
        status: initialData?.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.amount <= 0) {
            alert(t.fillRequiredFields);
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="income-form">
            <div className="form-group">
                <label>{t.description} *</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. GitHub, Netflix, Hosting"
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>{t.amount} *</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>{t.billingCycle}</label>
                    <select
                        value={formData.billingCycle}
                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                    >
                        <option value="monthly">{t.monthly}</option>
                        <option value="yearly">{t.yearly}</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>{t.category}</label>
                <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Tools, Hosting"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>{t.nextBillingDate}</label>
                    <input
                        type="date"
                        value={formData.nextBillingDate}
                        onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>{t.status}</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
