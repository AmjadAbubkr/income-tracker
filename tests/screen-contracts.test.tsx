import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnalyticsPage from '../src/components/AnalyticsPage';
import ExpensesPage from '../src/components/ExpensesPage';
import SalesPage from '../src/components/SalesPage';
import SubscriptionsPage from '../src/components/SubscriptionsPage';

const translations = {
  analytics: 'Analytics',
  expenses: 'Expenses',
  addExpense: 'Add expense',
  noExpensesYet: 'No expenses yet',
  sales: 'Sales',
  addProduct: 'Add product',
  subscriptions: 'Subscriptions',
  searchPlaceholder: 'Search',
  mrc: 'MRC',
  mrr: 'MRR',
  mrcDescription: 'Monthly costs',
  mrrDescription: 'Monthly revenue',
  mySubscriptions: 'My subscriptions',
  addSubscription: 'Add subscription',
  customerSubscriptions: 'Customer subscriptions',
  addCustomerSubscription: 'Add customer subscription',
  noSubscriptionsFound: 'No subscriptions found',
  totalRevenue: 'Total revenue',
  totalExpenses: 'Total expenses',
  netProfit: 'Net profit',
  export: 'Export',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  topProducts: 'Top products',
  noDataForPeriod: 'No data',
  itemsSold: 'items sold',
  confirm: 'Confirm',
  cancel: 'Cancel',
  failedToExport: 'Failed',
};

vi.mock('../src/context/LanguageContext', () => ({
  useLanguage: () => ({ t: translations }),
}));
vi.mock('../src/context/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    markAsRead: vi.fn(),
    clearAll: vi.fn(),
    refreshNotifications: vi.fn(async () => undefined),
  }),
}));
vi.mock('../src/hooks/useProducts', () => ({
  useProducts: () => ({ data: [] }),
}));
vi.mock('../src/stores/incomeStore', () => ({
  useIncomeStore: (selector?: (state: { entries: []; add: () => Promise<void> }) => unknown) => {
    const state = { entries: [], add: async () => undefined };
    return selector ? selector(state) : state;
  },
}));
vi.mock('../src/stores/expenseStore', () => ({
  useExpenseStore: (selector?: (state: { expenses: []; add: () => Promise<void>; remove: () => Promise<void> }) => unknown) => {
    const state = { expenses: [], add: async () => undefined, remove: async () => undefined };
    return selector ? selector(state) : state;
  },
}));
vi.mock('../src/stores/subscriptionStore', () => ({
  useSubscriptionStore: (selector?: (state: { business: []; customer: [] }) => unknown) => {
    const state = { business: [], customer: [] };
    return selector ? selector(state) : state;
  },
}));
vi.mock('../src/components/AnalyticsCharts', () => ({
  default: () => <div data-testid="analytics-charts" />,
}));

describe('screen component contracts', () => {
  it('renders the analytics route with the chart contract', () => {
    render(<AnalyticsPage currency="USD" currentMonth="2026-08" />);
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByTestId('analytics-charts')).toBeInTheDocument();
  });

  it('renders expenses without opening the optional form', () => {
    render(<ExpensesPage currency="USD" />);
    expect(screen.getByRole('heading', { name: 'Expenses' })).toBeInTheDocument();
  });

  it('renders sales with the product-form contract deferred until requested', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <SalesPage currency="USD" />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Sales' })).toBeInTheDocument();
  });

  it('renders subscriptions with optional summary icons', () => {
    render(<SubscriptionsPage currency="USD" />);
    expect(screen.getByRole('heading', { name: 'Subscriptions' })).toBeInTheDocument();
  });
});
