import { useMemo, useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';
import BusinessSubscriptionForm from './BusinessSubscriptionForm';
import CustomerSubscriptionForm from './CustomerSubscriptionForm';
import SummaryCard from './SummaryCard';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useNotifications } from '../context/NotificationContext';

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
    </svg>
);

interface SubscriptionsPageProps {
    currency: string;
}

export default function SubscriptionsPage({ currency }: SubscriptionsPageProps) {
    const { t } = useLanguage();
    const subscriptionStore = useSubscriptionStore();
    const { refreshNotifications } = useNotifications();
    const [search, setSearch] = useState('');
    const [showBusinessForm, setShowBusinessForm] = useState(false);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<string | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<string | null>(null);

    const handleRemoveBusiness = async (id: string) => {
        if (!window.confirm(t.confirmDeleteSubscription)) return;
        await subscriptionStore.removeBusiness(id);
        await refreshNotifications();
    };

    const handleRemoveCustomer = async (id: string) => {
        if (!window.confirm(t.confirmDeleteSubscription)) return;
        await subscriptionStore.removeCustomer(id);
        await refreshNotifications();
    };

    const filteredBusiness = useMemo(() => {
        return subscriptionStore.business.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [subscriptionStore.business, search]);

    const filteredCustomer = useMemo(() => {
        return subscriptionStore.customer.filter((s) =>
            s.customerName.toLowerCase().includes(search.toLowerCase())
        );
    }, [subscriptionStore.customer, search]);

    const mrc = useMemo(() => {
        return filteredBusiness
            .filter((s) => s.status === 'active')
            .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.amountMinor : Math.round(s.amountMinor / 12)), 0);
    }, [filteredBusiness]);

    const mrr = useMemo(() => {
        return filteredCustomer
            .filter((s) => s.status === 'active')
            .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.amountMinor : Math.round(s.amountMinor / 12)), 0);
    }, [filteredCustomer]);

    return (
        <div className="subscriptions-page">
            <div className="page-header">
                <h1>{t.subscriptions}</h1>
                <div className="search-bar">
                    <SearchIcon />
                    <label htmlFor="subscriptions-search" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{t.search}</label>
                    <input
                        id="subscriptions-search"
                        type="text"
                        name="subscriptionsSearch"
                        autoComplete="off"
                        aria-label={t.searchPlaceholder}
                        placeholder={`${t.searchPlaceholder}…`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="subscriptions-summary">
                <SummaryCard title={t.mrc} value={formatCurrency(mrc, currency)} description={t.mrcDescription} />
                <SummaryCard title={t.mrr} value={formatCurrency(mrr, currency)} description={t.mrrDescription} />
            </div>

            {/* Business Subscriptions */}
            <div className="subscription-section">
                <div className="section-header">
                    <h2>{t.mySubscriptions}</h2>
                    <button className="btn-primary" onClick={() => setShowBusinessForm(true)}>
                        <PlusIcon /> {t.addSubscription}
                    </button>
                </div>
                <div className="subscription-list">
                    {filteredBusiness.length === 0 ? (
                        <p>{t.noSubscriptionsFound}</p>
                    ) : (
                        filteredBusiness.map((sub) => (
                            <div key={sub.id} className="subscription-item">
                                <div className="subscription-info">
                                    <h3>{sub.name}</h3>
                                    <p>{sub.category} - {sub.nextBillingDate}</p>
                                </div>
                                <div className="subscription-actions">
                                    <span>{formatCurrency(sub.amountMinor, currency)}</span>
                                    <button type="button" onClick={() => setEditingBusiness(sub.id)} aria-label={t.editSubscription}>
                                        <EditIcon />
                                    </button>
                                    <button type="button" onClick={() => { void handleRemoveBusiness(sub.id); }} aria-label={t.delete}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Customer Subscriptions */}
            <div className="subscription-section">
                <div className="section-header">
                    <h2>{t.customerSubscriptions}</h2>
                    <button className="btn-primary" onClick={() => setShowCustomerForm(true)}>
                        <PlusIcon /> {t.addCustomerSubscription}
                    </button>
                </div>
                <div className="subscription-list">
                    {filteredCustomer.length === 0 ? (
                        <p>{t.noSubscriptionsFound}</p>
                    ) : (
                        filteredCustomer.map((sub) => (
                            <div key={sub.id} className="subscription-item">
                                <div className="subscription-info">
                                    <h3>{sub.customerName}</h3>
                                    <p>{sub.serviceName} - {sub.nextBillingDate}</p>
                                </div>
                                <div className="subscription-actions">
                                    <span>{formatCurrency(sub.amountMinor, currency)}</span>
                                    <button type="button" onClick={() => setEditingCustomer(sub.id)} aria-label={t.editSubscription}>
                                        <EditIcon />
                                    </button>
                                    <button type="button" onClick={() => { void handleRemoveCustomer(sub.id); }} aria-label={t.delete}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showBusinessForm && (
                <BusinessSubscriptionForm
                    currency={currency}
                    onClose={() => { setShowBusinessForm(false); setEditingBusiness(null); }}
                    onSubmit={async (data) => {
                        if (editingBusiness) {
                            await subscriptionStore.updateBusiness(editingBusiness, data);
                        } else {
                            await subscriptionStore.addBusiness(data);
                        }
                        await refreshNotifications();
                        setShowBusinessForm(false);
                        setEditingBusiness(null);
                    }}
                />
            )}
            {showCustomerForm && (
                <CustomerSubscriptionForm
                    currency={currency}
                    onClose={() => { setShowCustomerForm(false); setEditingCustomer(null); }}
                    onSubmit={async (data) => {
                        if (editingCustomer) {
                            await subscriptionStore.updateCustomer(editingCustomer, data);
                        } else {
                            await subscriptionStore.addCustomer(data);
                        }
                        await refreshNotifications();
                        setShowCustomerForm(false);
                        setEditingCustomer(null);
                    }}
                />
            )}
        </div>
    );
}
