import { useState } from 'react';
import { CustomerSubscription } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatMoneyInput, parseMoneyInput } from '../utils/currency';

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
        amountMinor: initialData?.amountMinor || 0,
        billingCycle: initialData?.billingCycle || 'monthly',
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        nextBillingDate: initialData?.nextBillingDate || initialData?.startDate || new Date().toISOString().split('T')[0],
        status: initialData?.status || 'active',
        notes: initialData?.notes || '',
    });
    const [amount, setAmount] = useState(initialData ? formatMoneyInput(initialData.amountMinor) : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountMinor = parseMoneyInput(amount);
        if (!formData.customerName || !formData.serviceName || amountMinor === null || amountMinor <= 0) {
            alert(t.fillRequiredFields);
            return;
        }
        onSubmit({ ...formData, amountMinor });
    };

    return (
        <form onSubmit={handleSubmit} className="income-form">
            <div className="form-group">
                <label htmlFor="cust-sub-name">{t.customerName} *</label>
                <input
                    id="cust-sub-name"
                    name="custSubCustomerName"
                    type="text"
                    autoComplete="off"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. John Doe, Acme Corp"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="cust-sub-service">{t.serviceName} *</label>
                <input
                    id="cust-sub-service"
                    name="custSubServiceName"
                    type="text"
                    autoComplete="off"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    placeholder="e.g. Premium Plan, Maintenance"
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="cust-sub-amount">{t.amount} *</label>
                    <input
                        id="cust-sub-amount"
                        name="custSubAmount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cust-sub-cycle">{t.billingCycle}</label>
                    <select
                        id="cust-sub-cycle"
                        name="custSubCycle"
                        value={formData.billingCycle}
                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as CustomerSubscription['billingCycle'] })}
                    >
                        <option value="monthly">{t.monthly}</option>
                        <option value="yearly">{t.yearly}</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="cust-sub-start">{t.startDate}</label>
                    <input
                        id="cust-sub-start"
                        name="custSubStartDate"
                        type="date"
                        autoComplete="off"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cust-sub-next">{t.nextBillingDate}</label>
                    <input
                        id="cust-sub-next"
                        name="custSubNextDate"
                        type="date"
                        autoComplete="off"
                        value={formData.nextBillingDate}
                        onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cust-sub-status">{t.status}</label>
                    <select
                        id="cust-sub-status"
                        name="custSubStatus"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerSubscription['status'] })}
                    >
                        <option value="active">{t.active}</option>
                        <option value="pending">{t.pending}</option>
                        <option value="expired">{t.expired}</option>
                        <option value="cancelled">{t.cancelled}</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="cust-sub-notes">{t.notesOptional}</label>
                <textarea
                    id="cust-sub-notes"
                    name="custSubNotes"
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
