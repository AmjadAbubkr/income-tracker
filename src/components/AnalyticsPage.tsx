import { useMemo, useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { exportToExcel } from '../utils/export';
import { buildPeriodReport, type ReportPeriod } from '../utils/reporting';
import { useLanguage } from '../context/LanguageContext';
import AnalyticsCharts from './AnalyticsCharts';
import PrintReport from './PrintReport';
import SummaryCard from './SummaryCard';
import { useIncomeStore } from '../stores/incomeStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useProducts } from '../hooks/useProducts';

interface AnalyticsPageProps {
  currency: string;
  currentMonth: string;
}

export default function AnalyticsPage({ currency, currentMonth }: AnalyticsPageProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ReportPeriod>('weekly');
  const incomeEntries = useIncomeStore((state) => state.entries);
  const expenses = useExpenseStore((state) => state.expenses);
  const { data: products = [] } = useProducts();
  const anchorDate = viewMode === 'monthly' ? `${currentMonth}-01` : new Date().toISOString().split('T')[0]!;

  const report = useMemo(
    () => buildPeriodReport(incomeEntries, expenses, products, viewMode, anchorDate),
    [anchorDate, expenses, incomeEntries, products, viewMode],
  );

  const handleExport = async () => {
    try {
      await exportToExcel(report, products, currency, viewMode === 'daily' ? 'daily' : 'monthly');
    } catch (error) {
      console.error('Export failed', error);
      alert(t.failedToExport);
    }
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>{t.analytics}</h1>
        <div className="page-actions">
          <button type="button" className="btn-secondary" onClick={handleExport}>{t.export}</button>
          <button type="button" className="btn-secondary" onClick={() => window.print()}>{t.printReport}</button>
        </div>
      </div>

      <div className="analytics-summary">
        <SummaryCard title={t.totalRevenue} value={formatCurrency(report.totalRevenueMinor, currency)} />
        <SummaryCard title={t.totalExpenses} value={formatCurrency(report.totalExpensesMinor, currency)} />
        <SummaryCard title={t.netProfit} value={formatCurrency(report.netProfitMinor, currency)} />
      </div>

      <div className="analytics-controls">
        {(['daily', 'weekly', 'monthly', 'yearly', 'allTime'] as const).map((mode) => (
          <button key={mode} type="button" className={viewMode === mode ? 'active' : ''} onClick={() => setViewMode(mode)}>
            {t[mode]}
          </button>
        ))}
      </div>

      <div className="analytics-charts">
        <AnalyticsCharts
          incomeEntries={report.incomeEntries}
          expenses={report.expenses}
          products={products}
          currency={currency}
          viewMode={viewMode}
        />
      </div>

      <div className="top-products">
        <h2>{t.topProducts}</h2>
        {report.topProducts.length === 0 ? (
          <p>{t.noDataForPeriod}</p>
        ) : (
          report.topProducts.map((product) => (
            <div key={product.productId} className="top-product-item">
              <span>{product.name}</span>
              <span>{formatCurrency(product.revenueMinor, currency)}</span>
              <span>{product.quantity} {t.itemsSold}</span>
            </div>
          ))
        )}
      </div>

      <PrintReport report={report} currency={currency} period={viewMode} />
    </div>
  );
}
