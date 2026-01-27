import { useMemo, useState } from 'react';
import { BusinessSubscription, CustomerSubscription } from '../types';
import { useLanguage } from '../context/LanguageContext';
import BusinessSubscriptionForm from './BusinessSubscriptionForm';
import CustomerSubscriptionForm from './CustomerSubscriptionForm';
import SummaryCard from './SummaryCard';

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const TrendingDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
    </svg>
);

interface SubscriptionsPageProps {
    businessSubscriptions: BusinessSubscription[];
    customerSubscriptions: CustomerSubscription[];
    onAddBusinessSub: (sub: Omit<BusinessSubscription, 'id'>) => Promise<void>;
    onEditBusinessSub: (sub: Omit<BusinessSubscription, 'id'>, id: string) => Promise<void>;
    onDeleteBusinessSub: (id: string) => Promise<void>;
    onAddCustomerSub: (sub: Omit<CustomerSubscription, 'id'>) => Promise<void>;
    onEditCustomerSub: (sub: Omit<CustomerSubscription, 'id'>, id: string) => Promise<void>;
    onDeleteCustomerSub: (id: string) => Promise<void>;
    currency: string;
}

export default function SubscriptionsPage({
    businessSubscriptions,
    customerSubscriptions,
    onAddBusinessSub,
    onEditBusinessSub,
    onDeleteBusinessSub,
    onAddCustomerSub,
    onEditCustomerSub,
    onDeleteCustomerSub,
    currency,
}: SubscriptionsPageProps) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'business' | 'customer'>('business');
    const [showBusinessForm, setShowBusinessForm] = useState(false);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const calculateMRC = (subs: BusinessSubscription[]) => {
        return subs
            .filter(s => s.status === 'active')
            .reduce((total, sub) => {
                const amount = sub.amount;
                return total + (sub.billingCycle === 'monthly' ? amount : amount / 12);
            }, 0);
    };

    const calculateMRR = (subs: CustomerSubscription[]) => {
        return subs
            .filter(s => s.status === 'active')
            .reduce((total, sub) => {
                const amount = sub.amount;
                return total + (sub.billingCycle === 'monthly' ? amount : amount / 12);
            }, 0);
    };

    const mrc = useMemo(() => calculateMRC(businessSubscriptions), [businessSubscriptions]);
    const mrr = useMemo(() => calculateMRR(customerSubscriptions), [customerSubscriptions]);
    const netRecurring = mrr - mrc;

    const filteredBusiness = useMemo(() => {
        return businessSubscriptions.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [businessSubscriptions, searchTerm, statusFilter]);

    const filteredCustomer = useMemo(() => {
        return customerSubscriptions.filter(s => {
            const matchesSearch = s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [customerSubscriptions, searchTerm, statusFilter]);

    const businessStatusOptions = [
        { value: 'all', label: t.allStatuses },
        { value: 'active', label: t.active },
        { value: 'paused', label: t.paused },
        { value: 'cancelled', label: t.cancelled },
    ];

    const customerStatusOptions = [
        { value: 'all', label: t.allStatuses },
        { value: 'active', label: t.active },
        { value: 'pending', label: t.pending },
        { value: 'expired', label: t.expired },
        { value: 'cancelled', label: t.cancelled },
    ];

    const handleEdit = (id: string) => {
        setEditingId(id);
        if (activeTab === 'business') setShowBusinessForm(true);
        else setShowCustomerForm(true);
    };

    const closeForms = () => {
        setShowBusinessForm(false);
        setShowCustomerForm(false);
        setEditingId(null);
    };

    const openAddBusiness = () => {
        setActiveTab('business');
        setEditingId(null);
        setShowCustomerForm(false);
        setShowBusinessForm(true);
    };

    const openAddCustomer = () => {
        setActiveTab('customer');
        setEditingId(null);
        setShowBusinessForm(false);
        setShowCustomerForm(true);
    };

    return (
        <div className="subscriptions-page">
            <div className="page-header">
                <h1>{t.subscriptions}</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={openAddCustomer}>
                        <PlusIcon /> <TrendingUpIcon /> {t.addCustomerSubscription}
                    </button>
                    <button className="btn btn-secondary" onClick={openAddBusiness}>
                        <PlusIcon /> <TrendingDownIcon /> {t.addSubscription}
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <SummaryCard
                    title={t.mrr}
                    value={`${currency} ${mrr.toFixed(2)}`}
                    icon={<TrendingUpIcon />}
                    className="revenue-card"
                />
                <SummaryCard
                    title={t.mrc}
                    value={`${currency} ${mrc.toFixed(2)}`}
                    icon={<TrendingDownIcon />}
                    className="expenses-card"
                />
                <SummaryCard
                    title={t.netProfit}
                    value={`${currency} ${netRecurring.toFixed(2)}`}
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                    className={netRecurring >= 0 ? 'profit-card' : 'loss-card'}
                />
            </div>

            <div className="analytics-controls" style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${activeTab === 'business' ? 'active' : ''}`}
                        onClick={() => setActiveTab('business')}
                    >
                        {t.mySubscriptions}
                    </button>
                    <button
                        className={`toggle-btn ${activeTab === 'customer' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customer')}
                    >
                        {t.customerSubscriptions}
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                <div className="analytics-controls" style={{ marginBottom: 0 }}>
                    <div className="header-search" style={{ maxWidth: 520 }}>
                        <span className="search-icon"><SearchIcon /></span>
                        <input
                            className="search-input"
                            type="text"
                            placeholder={t.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="settings-select"
                        style={{ width: 200 }}
                    >
                        {(activeTab === 'business' ? businessStatusOptions : customerStatusOptions).map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="tab-content">
                {activeTab === 'business' ? (
                    <div className="products-table-container">
                        {filteredBusiness.length === 0 ? (
                            <p className="empty-state">{t.noSubscriptionsFound}</p>
                        ) : (
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>{t.description}</th>
                                        <th>{t.amount}</th>
                                        <th>{t.billingCycle}</th>
                                        <th>{t.nextBillingDate}</th>
                                        <th>{t.status}</th>
                                        <th>{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBusiness.map((sub) => (
                                        <tr key={sub.id}>
                                            <td>{sub.name}</td>
                                            <td>{currency} {sub.amount.toFixed(2)}</td>
                                            <td>{sub.billingCycle === 'monthly' ? t.monthly : t.yearly}</td>
                                            <td>{sub.nextBillingDate}</td>
                                            <td>
                                                <span className={`status-badge status-${sub.status}`}>
                                                    {t[sub.status as keyof typeof t] || sub.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn-table-edit" onClick={() => handleEdit(sub.id)} title={t.edit}>
                                                        <EditIcon />
                                                    </button>
                                                    <button
                                                        className="btn-table-delete"
                                                        onClick={() => onDeleteBusinessSub(sub.id)}
                                                        title={t.delete}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    <div className="products-table-container">
                        {filteredCustomer.length === 0 ? (
                            <p className="empty-state">{t.noSubscriptionsFound}</p>
                        ) : (
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>{t.customerName}</th>
                                        <th>{t.serviceName}</th>
                                        <th>{t.amount}</th>
                                        <th>{t.billingCycle}</th>
                                        <th>{t.nextBillingDate}</th>
                                        <th>{t.status}</th>
                                        <th>{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomer.map((sub) => (
                                        <tr key={sub.id}>
                                            <td>{sub.customerName}</td>
                                            <td>{sub.serviceName}</td>
                                            <td>{currency} {sub.amount.toFixed(2)}</td>
                                            <td>{sub.billingCycle === 'monthly' ? t.monthly : t.yearly}</td>
                                            <td>{sub.nextBillingDate}</td>
                                            <td>
                                                <span className={`status-badge status-${sub.status}`}>
                                                    {t[sub.status as keyof typeof t] || sub.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn-table-edit" onClick={() => handleEdit(sub.id)} title={t.edit}>
                                                        <EditIcon />
                                                    </button>
                                                    <button
                                                        className="btn-table-delete"
                                                        onClick={() => onDeleteCustomerSub(sub.id)}
                                                        title={t.delete}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {showBusinessForm && (
                <div className="modal-overlay" onClick={closeForms}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? t.edit : t.addSubscription}</h2>
                            <button className="modal-close" onClick={closeForms} title={t.close}>×</button>
                        </div>
                        <div className="modal-body">
                            <BusinessSubscriptionForm
                                onSubmit={async (data: Omit<BusinessSubscription, 'id'>) => {
                                    if (editingId) await onEditBusinessSub(data, editingId);
                                    else await onAddBusinessSub(data);
                                    closeForms();
                                }}
                                onClose={closeForms}
                                initialData={editingId ? businessSubscriptions.find(s => s.id === editingId) : undefined}
                            />
                        </div>
                    </div>
                </div>
            )}

            {showCustomerForm && (
                <div className="modal-overlay" onClick={closeForms}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? t.edit : t.addCustomerSubscription}</h2>
                            <button className="modal-close" onClick={closeForms} title={t.close}>×</button>
                        </div>
                        <div className="modal-body">
                            <CustomerSubscriptionForm
                                onSubmit={async (data: Omit<CustomerSubscription, 'id'>) => {
                                    if (editingId) await onEditCustomerSub(data, editingId);
                                    else await onAddCustomerSub(data);
                                    closeForms();
                                }}
                                onClose={closeForms}
                                initialData={editingId ? customerSubscriptions.find(s => s.id === editingId) : undefined}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
