import { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/currency';
import { exportToExcel } from '../utils/export';
import { useLanguage } from '../context/LanguageContext';
import AnalyticsCharts from './AnalyticsCharts';
import SummaryCard from './SummaryCard';
import { useIncomeStore } from '../stores/incomeStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useProducts } from '../hooks/useProducts';

interface AnalyticsPageProps {
  currency: string;
  currentMonth: string;
}

export default function AnalyticsPage({
  currency,
  currentMonth,
}: AnalyticsPageProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  const incomeEntries = useIncomeStore((s) => s.entries);
  const expenses = useExpenseStore((s) => s.expenses);
  const businessSubscriptions = useSubscriptionStore((s) => s.business);
  const customerSubscriptions = useSubscriptionStore((s) => s.customer);
  const { data: products = [] } = useProducts();

  const filteredIncome = useMemo(() => {
    const now = new Date();
    if (viewMode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      return incomeEntries.filter((e) => e.date === today);
    } else if (viewMode === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return incomeEntries.filter((e) => e.date >= weekAgo);
    } else if (viewMode === 'monthly') {
      const monthStart = currentMonth + '-01';
      return incomeEntries.filter((e) => e.date >= monthStart);
    } else {
      const yearStart = now.getFullYear().toString() + '-01-01';
      return incomeEntries.filter((e) => e.date >= yearStart);
    }
  }, [incomeEntries, viewMode, currentMonth]);

  const totalRevenueMinor = useMemo(() => filteredIncome.reduce((sum, e) => sum + e.amountMinor, 0), [filteredIncome]);
  const totalExpensesMinor = useMemo(() => expenses.reduce((sum, e) => sum + e.amountMinor, 0), [expenses]);
  const netProfitMinor = totalRevenueMinor - totalExpensesMinor;

  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; revenue: number; quantity: number }> = {};
    filteredIncome.forEach((entry) => {
      if (!productMap[entry.productId]) {
        productMap[entry.productId] = { name: entry.productId, revenue: 0, quantity: 0 };
      }
      productMap[entry.productId].revenue += entry.amountMinor;
      productMap[entry.productId].quantity += entry.quantity;
    });
    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredIncome]);

  const handleExport = async () => {
    try {
      await exportToExcel(incomeEntries, [], currency, viewMode === 'daily' ? 'daily' : 'monthly');
    } catch (error) {
      console.error('Export failed', error);
      alert(t.failedToExport);
    }
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>{t.analytics}</h1>
        <button className="btn-secondary" onClick={handleExport}>
          {t.export}
        </button>
      </div>

      <div className="analytics-summary">
        <SummaryCard title={t.totalRevenue} value={formatCurrency(totalRevenueMinor, currency)} />
        <SummaryCard title={t.totalExpenses} value={formatCurrency(totalExpensesMinor, currency)} />
        <SummaryCard title={t.netProfit} value={formatCurrency(netProfitMinor, currency)} />
      </div>

      <div className="analytics-controls">
        {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
          <button key={mode} className={viewMode === mode ? 'active' : ''} onClick={() => setViewMode(mode)}>
            {t[mode]}
          </button>
        ))}
      </div>

      <div className="analytics-charts">
        <AnalyticsCharts
          incomeEntries={filteredIncome}
          products={products}
          currency={currency}
          viewMode={viewMode}
        />
      </div>

      <div className="top-products">
        <h2>{t.topProducts}</h2>
        {topProducts.length === 0 ? (
          <p>{t.noDataForPeriod}</p>
        ) : (
          topProducts.map((product) => (
            <div key={product.name} className="top-product-item">
              <span>{product.name}</span>
              <span>{formatCurrency(product.revenue, currency)}</span>
              <span>{product.quantity} {t.itemsSold}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
