import { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/currency';
import { useIncomeStore } from '../stores/incomeStore';
import { useExpenseStore } from '../stores/expenseStore';

/* ── Inline Material Symbol helper ── */
const MIcon = ({ name, size = 16 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }} aria-hidden="true">{name}</span>
);

interface DashboardProps {
  currency: string;
}

export default function Dashboard({ currency }: DashboardProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  const incomeEntries = useIncomeStore((s) => s.entries);
  const expenses = useExpenseStore((s) => s.expenses);

  const dashboardChartData = useMemo(() => {
    if (viewMode === 'daily') {
      const dailyMap: Record<string, { income: number; expenses: number }> = {};
      const now = new Date();
      // Seed last 15 days
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const k = d.toISOString().split('T')[0];
        dailyMap[k] = { income: 0, expenses: 0 };
      }

      incomeEntries.forEach((e) => {
        if (e.date) {
          const k = e.date.split('T')[0];
          if (dailyMap[k]) dailyMap[k].income += e.amountMinor;
        }
      });

      expenses.forEach((e) => {
        if (e.date) {
          const k = e.date.split('T')[0];
          if (dailyMap[k]) dailyMap[k].expenses += e.amountMinor;
        }
      });

      return Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({
        name: date.slice(5),
        revenue: values.income,
        costs: values.expenses,
      }));
    } else if (viewMode === 'weekly') {
      const weeklyMap: Record<string, { income: number; expenses: number }> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
        const key = `${d.getFullYear()}-W${String(Math.ceil((d.getDate()) / 7)).padStart(2, '0')}`;
        weeklyMap[key] = { income: 0, expenses: 0 };
      }

      incomeEntries.forEach((e) => {
        if (e.date) {
          const d = new Date(e.date);
          const key = `${d.getFullYear()}-W${String(Math.ceil((d.getDate()) / 7)).padStart(2, '0')}`;
          if (weeklyMap[key]) weeklyMap[key].income += e.amountMinor;
        }
      });

      expenses.forEach((e) => {
        if (e.date) {
          const d = new Date(e.date);
          const key = `${d.getFullYear()}-W${String(Math.ceil((d.getDate()) / 7)).padStart(2, '0')}`;
          if (weeklyMap[key]) weeklyMap[key].expenses += e.amountMinor;
        }
      });

      return Object.entries(weeklyMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([date, values]) => ({
        name: date,
        revenue: values.income,
        costs: values.expenses,
      }));
    } else if (viewMode === 'monthly') {
      const monthlyMap: Record<string, { income: number; expenses: number }> = {};

      incomeEntries.forEach((e) => {
        if (e.date) {
          const key = e.date.slice(0, 7);
          if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expenses: 0 };
          monthlyMap[key].income += e.amountMinor;
        }
      });

      expenses.forEach((e) => {
        if (e.date) {
          const key = e.date.slice(0, 7);
          if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expenses: 0 };
          monthlyMap[key].expenses += e.amountMinor;
        }
      });

      return Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([date, values]) => ({
        name: date,
        revenue: values.income,
        costs: values.expenses,
      }));
    } else {
      // yearly
      const yearlyMap: Record<string, { income: number; expenses: number }> = {};

      incomeEntries.forEach((e) => {
        if (e.date) {
          const key = e.date.slice(0, 4);
          if (!yearlyMap[key]) yearlyMap[key] = { income: 0, expenses: 0 };
          yearlyMap[key].income += e.amountMinor;
        }
      });

      expenses.forEach((e) => {
        if (e.date) {
          const key = e.date.slice(0, 4);
          if (!yearlyMap[key]) yearlyMap[key] = { income: 0, expenses: 0 };
          yearlyMap[key].expenses += e.amountMinor;
        }
      });

      return Object.entries(yearlyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({
        name: date,
        revenue: values.income,
        costs: values.expenses,
      }));
    }
  }, [viewMode, incomeEntries, expenses]);

  /* ── Summary metrics ── */
  const totalRevenueMinor = useMemo(() => incomeEntries.reduce((sum, e) => sum + e.amountMinor, 0), [incomeEntries]);
  const totalExpensesMinor = useMemo(() => expenses.reduce((sum, e) => sum + e.amountMinor, 0), [expenses]);
  const netProfitMinor = totalRevenueMinor - totalExpensesMinor;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p>{formatCurrency(totalRevenueMinor, currency)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p>{formatCurrency(totalExpensesMinor, currency)}</p>
        </div>
        <div className="summary-card">
          <h3>Net Profit</h3>
          <p>{formatCurrency(netProfitMinor, currency)}</p>
        </div>
      </div>

      <div className="dashboard-chart">
        <div className="chart-header">
          <h2>Revenue vs Expenses</h2>
          <div className="chart-controls">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((mode) => (
              <button
                key={mode}
                className={viewMode === mode ? 'active' : ''}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={dashboardChartData}>
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
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
            <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" />
            <Area type="monotone" dataKey="costs" stroke="#ef4444" fillOpacity={1} fill="url(#colorCosts)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
