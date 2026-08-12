import { useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/currency';
import { useIncomeStore } from '../stores/incomeStore';
import { useExpenseStore } from '../stores/expenseStore';
import { buildPeriodReport, groupReportAmounts, type ReportPeriod } from '../utils/reporting';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../hooks/useProducts';

interface DashboardProps {
  currency: string;
}

export default function Dashboard({ currency }: DashboardProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ReportPeriod>('weekly');
  const incomeEntries = useIncomeStore((state) => state.entries);
  const expenses = useExpenseStore((state) => state.expenses);
  const { data: products = [] } = useProducts();

  const report = useMemo(
    () => buildPeriodReport(incomeEntries, expenses, products, viewMode),
    [expenses, incomeEntries, products, viewMode],
  );
  const chartData = useMemo(
    () => groupReportAmounts(report, viewMode).map((item) => ({
      name: item.name,
      revenue: item.revenueMinor,
      costs: item.expensesMinor,
    })),
    [report, viewMode],
  );

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>{t.dashboard}</h1>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>{t.totalRevenue}</h3>
          <p>{formatCurrency(report.totalRevenueMinor, currency)}</p>
        </div>
        <div className="summary-card">
          <h3>{t.totalExpenses}</h3>
          <p>{formatCurrency(report.totalExpensesMinor, currency)}</p>
        </div>
        <div className="summary-card">
          <h3>{t.netProfit}</h3>
          <p>{formatCurrency(report.netProfitMinor, currency)}</p>
        </div>
      </div>

      <div className="dashboard-chart">
        <div className="chart-header">
          <h2>{t.revenueVsExpenses}</h2>
          <div className="chart-controls">
            {(['daily', 'weekly', 'monthly', 'yearly', 'allTime'] as const).map((mode) => (
              <button key={mode} type="button" className={viewMode === mode ? 'active' : ''} onClick={() => setViewMode(mode)}>
                {t[mode]}
              </button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="chart-empty-state dashboard-chart-empty" role="status">
            {t.noDataForPeriod}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value: number) => formatCurrency(value, currency)} />
              <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="costs" stroke="#ef4444" fillOpacity={1} fill="url(#colorCosts)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <section className="recent-activity" aria-labelledby="dashboard-activity-title">
        <h2 id="dashboard-activity-title">{t.recentActivity}</h2>
        {report.recentActivity.length === 0 ? (
          <p>{t.noDataForPeriod}</p>
        ) : (
          report.recentActivity.map((activity) => (
            <div key={activity.id} className="history-item">
              <span>{activity.date} · {activity.kind === 'sale' ? t.income : t.expenses}: {activity.label}</span>
              <strong>{formatCurrency(activity.amountMinor, currency)}</strong>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
