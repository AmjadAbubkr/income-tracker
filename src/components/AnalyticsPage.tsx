import { useState, useMemo } from 'react';
import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription } from '../types';
import { formatCurrency } from '../utils/currency';
import { exportToExcel } from '../utils/export';

import { useLanguage } from '../context/LanguageContext';
import AnalyticsCharts from './AnalyticsCharts';
import SummaryCard from './SummaryCard';

interface AnalyticsPageProps {
  products: Product[];
  incomeEntries: IncomeEntry[];
  expenses: Expense[];
  businessSubscriptions: BusinessSubscription[];
  customerSubscriptions: CustomerSubscription[];
  currency: string;
  currentMonth: string;
}

export default function AnalyticsPage({
  products,
  incomeEntries,
  expenses,
  businessSubscriptions,
  customerSubscriptions,
  currency,
  currentMonth,
}: AnalyticsPageProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [isExporting, setIsExporting] = useState(false);

  // ... (existing useMemo logic)
  const analytics = useMemo(() => {
    const totalRevenue = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalSales = incomeEntries.length;
    const totalItems = incomeEntries.reduce((sum, e) => sum + e.quantity, 0);
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Product performance
    const productPerformance = products.map((product) => {
      const entries = incomeEntries.filter((e) => e.productId === product.id);
      const revenue = entries.reduce((sum, e) => sum + e.amount, 0);
      const quantity = entries.reduce((sum, e) => sum + e.quantity, 0);
      return {
        ...product,
        revenue,
        quantity,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Weekly/Monthly breakdown
    const breakdown = viewMode === 'weekly'
      ? getWeeklyBreakdown(incomeEntries)
      : getMonthlyBreakdown(incomeEntries);

    // Monthly Recurring Metrics
    const mrc = businessSubscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12), 0);

    const mrr = customerSubscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12), 0);

    return {
      totalRevenue,
      totalSales,
      totalItems,
      avgOrderValue,
      totalExpenses,
      netProfit,
      profitMargin,
      productPerformance,
      breakdown,
      mrr,
      mrc,
    };
  }, [products, incomeEntries, expenses, businessSubscriptions, customerSubscriptions, viewMode, t]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(incomeEntries, products, currency, 'monthly', currentMonth);
    } catch (error) {
      console.error('Export error:', error);
      alert(t.failedToExport);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>{t.analytics}</h1>
        <p className="page-subtitle">{t.analyticsSubtitle}</p>
      </div>

      <div className="analytics-controls">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
            onClick={() => setViewMode('weekly')}
          >
            {t.weekly}
          </button>
          <button
            className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
          >
            {t.monthly}
          </button>
        </div>

        <button
          onClick={handleExport}
          className="btn btn-secondary"
          disabled={isExporting}
        >
          {isExporting ? t.exporting : t.exportAnalytics}
        </button>
      </div>

      <AnalyticsCharts
        incomeEntries={incomeEntries}
        products={products}
        currency={currency}
      />

      <div className="analytics-summary">
        <SummaryCard
          title={t.totalRevenue}
          value={formatCurrency(analytics.totalRevenue, currency)}
          icon="💰"
          className="revenue-card"
        />
        <SummaryCard
          title={t.netProfit}
          value={formatCurrency(analytics.netProfit, currency)}
          icon="📈"
          trend={`${analytics.profitMargin.toFixed(1)}%`}
          className="profit-card"
        />
        <SummaryCard
          title={t.avgOrderValue}
          value={formatCurrency(analytics.avgOrderValue, currency)}
          icon="📊"
          className="neutral-card"
        />
        <SummaryCard
          title={t.mrr}
          value={formatCurrency(analytics.mrr, currency)}
          icon="🔁"
          trend={t.mrrDescription}
          className="revenue-card"
        />
        <SummaryCard
          title={t.mrc}
          value={formatCurrency(analytics.mrc, currency)}
          icon="📉"
          trend={t.mrcDescription}
          className="expenses-card"
        />
        <SummaryCard
          title={t.projectedNetProfit}
          value={formatCurrency(analytics.netProfit + analytics.mrr - analytics.mrc, currency)}
          icon="🔮"
          trend={t.projectedNetProfitDescription}
          className="profit-card"
        />
      </div>

      <div className="analytics-sections">
        <div className="analytics-section">
          <h2>{t.productPerformance}</h2>
          <div className="product-performance-list">
            {analytics.productPerformance.length === 0 ? (
              <p className="empty-state">{t.noSalesDataAvailable}</p>
            ) : (
              analytics.productPerformance.map((product) => (
                <div key={product.id} className="performance-item">
                  <div className="performance-header">
                    <span className="performance-name">{product.name}</span>
                    <span className="performance-revenue">{formatCurrency(product.revenue, currency)}</span>
                  </div>
                  <div className="performance-bar">
                    <div
                      className="performance-bar-fill"
                      style={{ width: `${product.percentage}%` }}
                    />
                  </div>
                  <div className="performance-details">
                    <span>{t.soldCount.replace('{count}', product.quantity.toString())}</span>
                    <span>{t.percentOfTotal.replace('{percent}', product.percentage.toFixed(1))}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h2>{t.breakdownByPeriod.replace('{period}', viewMode === 'weekly' ? t.weekly : t.monthly)}</h2>
          <div className="breakdown-list">
            {analytics.breakdown.length === 0 ? (
              <p className="empty-state">{t.noDataForPeriod}</p>
            ) : (
              analytics.breakdown.map((item, index) => (
                <div key={index} className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-period">{item.period}</span>
                    <span className="breakdown-revenue">{formatCurrency(item.revenue, currency)}</span>
                  </div>
                  <div className="breakdown-details">
                    <span>{t.salesCount.replace('{count}', item.sales.toString())}</span>
                    <span>{t.itemsCount.replace('{count}', item.items.toString())}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getWeeklyBreakdown(entries: IncomeEntry[]) {
  const weeks: Record<string, { revenue: number; sales: number; items: number }> = {};

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeks[weekKey]) {
      weeks[weekKey] = { revenue: 0, sales: 0, items: 0 };
    }
    weeks[weekKey].revenue += entry.amount;
    weeks[weekKey].sales += 1;
    weeks[weekKey].items += entry.quantity;
  });

  return Object.entries(weeks)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)
    .map(([weekKey, data]) => ({
      period: new Date(weekKey).toLocaleDateString(),
      revenue: data.revenue,
      sales: data.sales,
      items: data.items,
    }));
}

function getMonthlyBreakdown(entries: IncomeEntry[]) {
  const months: Record<string, { revenue: number; sales: number; items: number }> = {};

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!months[monthKey]) {
      months[monthKey] = { revenue: 0, sales: 0, items: 0 };
    }
    months[monthKey].revenue += entry.amount;
    months[monthKey].sales += 1;
    months[monthKey].items += entry.quantity;
  });

  return Object.entries(months)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)
    .map(([monthKey, data]) => ({
      period: new Date(monthKey + '-01').toLocaleDateString(undefined, { year: 'numeric', month: 'long' }),
      revenue: data.revenue,
      sales: data.sales,
      items: data.items,
    }));
}

