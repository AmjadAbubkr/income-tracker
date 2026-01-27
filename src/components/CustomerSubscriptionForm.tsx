import { useState } from 'react';
import { CustomerSubscription } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CustomerSubscriptionFormProps {
    onSubmit: (sub: Omit<CustomerSubscription, 'id'>) => Promise<void>;
    onClose: () => void;
    initialData?: CustomerSubscription;
}

export default function CustomerSubscriptionForm({ onSubmit, onClose, initialData }: CustomerSubscriptionFormProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Omit<CustomerSubscription, 'id'>>({
        customerName: initialData?.customerName || '',
        serviceName: initialData?.serviceName || '',
        amount: initialData?.amount || 0,
        billingCycle: initialData?.billingCycle || 'monthly',
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        nextBillingDate: initialData?.nextBillingDate || initialData?.startDate || new Date().toISOString().split('T')[0],
        status: initialData?.status || 'active',
        notes: initialData?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerName || !formData.serviceName || formData.amount <= 0) {
            alert(t.fillRequiredFields);
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="income-form">
            <div className="form-group">
                <label>{t.customerName} *</label>
                <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. John Doe, Acme Corp"
                    required
                />
            </div>

            <div className="form-group">
                <label>{t.serviceName} *</label>
                <input
                    type="text"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    placeholder="e.g. Premium Plan, Maintenance"
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

            <div className="form-row">
                <div className="form-group">
                    <label>{t.startDate}</label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>
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
                        <option value="pending">{t.pending}</option>
                        <option value="expired">{t.expired}</option>
                        <option value="cancelled">{t.cancelled}</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>{t.notesOptional}</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t.optionalNotesPlaceholder}
                />
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
