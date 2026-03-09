import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { IncomeEntry, Expense, BusinessSubscription, CustomerSubscription } from '../types';
import { formatCurrency } from '../utils/currency';

/* ── Inline Material Symbol helper ── */
const MIcon = ({ name, size = 16 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{name}</span>
);

interface DashboardProps {
  products: any[];
  incomeEntries: IncomeEntry[];
  expenses: Expense[];
  businessSubscriptions: BusinessSubscription[];
  customerSubscriptions: CustomerSubscription[];
  currency: string;
}

export default function Dashboard({
  incomeEntries,
  expenses,
  businessSubscriptions,
  customerSubscriptions,
  currency,
}: DashboardProps) {

  /* ── Financial Logic & Analytics ── */
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = lastMonthDate.toISOString().slice(0, 7);

    // 1. Subscription Metrics (MRR/MRC)
    const activeMRC = businessSubscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12), 0);

    const activeMRR = customerSubscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12), 0);

    // 2. Totals
    const histIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
    const histExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBalance = histIncome - histExpenses;

    // 3. Monthly Actuals
    const getMonthIncome = (m: string) => incomeEntries.filter(e => e.date.startsWith(m)).reduce((sum, e) => sum + e.amount, 0);
    const getMonthExpenses = (m: string) => expenses.filter(e => e.date.startsWith(m)).reduce((sum, e) => sum + e.amount, 0);

    const currIncome = getMonthIncome(currentMonthStr) + activeMRR;
    const currExpenses = getMonthExpenses(currentMonthStr) + activeMRC;
    const prevIncome = getMonthIncome(lastMonthStr) + activeMRR;
    const prevExpenses = getMonthExpenses(lastMonthStr) + activeMRC;

    // 4. Trend Logic
    const calcTrend = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    // 5. Chart Data (History)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = d.toLocaleDateString(undefined, { month: 'short' });
      const mStr = d.toISOString().slice(0, 7);
      chartData.push({
        name: mLabel,
        income: getMonthIncome(mStr) + activeMRR,
        expenses: getMonthExpenses(mStr) + activeMRC
      });
    }

    // 6. Merged Recent Activity
    const recent = [
      ...incomeEntries.map(e => ({ ...e, type: 'income' as const })),
      ...expenses.map(e => ({ ...e, type: 'expense' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return { totalBalance, currIncome, currExpenses, incomeTrend: calcTrend(currIncome, prevIncome), expenseTrend: calcTrend(currExpenses, prevExpenses), chartData, recent };
  }, [incomeEntries, expenses, businessSubscriptions, customerSubscriptions]);

  return (
    <div className="dashboard-v2 mobile-redesign">
      {/* 1. Main Balance Card (Blue Premium) */}
      <div className="main-balance-card">
        <div className="card-top">
          <span className="card-label">Total Balance</span>
          <div className="currency-badge">USD</div>
        </div>
        <div className="balance-amount">
          {formatCurrency(metrics.totalBalance, currency)}
        </div>
        <div className="balance-trend">
          <div className="trend-chip positive">
            <MIcon name="trending_up" size={16} />
            <span>+2.5% from last month</span>
          </div>
        </div>
      </div>

      {/* 3. Income & Expense Small Cards */}
      <div className="sub-stats-row">
        <div className="sub-stat-card income">
          <div className="stat-icon-circle">
            <MIcon name="arrow_downward" size={20} />
          </div>
          <span className="stat-label">Income</span>
          <span className="stat-value">{formatCurrency(metrics.currIncome, currency)}</span>
        </div>
        <div className="sub-stat-card expense">
          <div className="stat-icon-circle">
            <MIcon name="arrow_upward" size={20} />
          </div>
          <span className="stat-label">Expense</span>
          <span className="stat-value">{formatCurrency(metrics.currExpenses, currency)}</span>
        </div>
      </div>

      {/* 4. Weekly Spend Chart Section */}
      <section className="dashboard-section-v3 spend-chart">
        <div className="section-header">
          <h2>Weekly Spend</h2>
          <button className="view-report-btn">View Report <MIcon name="chevron_right" size={16} /></button>
        </div>
        <div className="chart-container-v3">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={metrics.chartData}>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1152d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1152d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#1152d4', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#1152d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#blueGradient)"
                dot={{ r: 4, fill: '#1152d4', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 5. Recent Transactions Refined */}
      <section className="dashboard-section-v3 transactions">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <button className="view-all-btn">See All</button>
        </div>
        <div className="refined-transaction-list">
          {metrics.recent.map(tx => (
            <div key={tx.id} className="refined-tx-item">
              <div className="tx-icon-bg">
                <MIcon name={tx.type === 'income' ? 'payments' : 'coffee'} size={20} />
              </div>
              <div className="tx-details">
                <p className="tx-name">{tx.type === 'income' ? 'Income' : (tx as Expense).description}</p>
                <p className="tx-time">{new Date(tx.date).toLocaleDateString()}, 10:45 AM</p>
              </div>
              <div className={`tx-amount ${tx.type === 'income' ? 'pos' : 'neg'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
