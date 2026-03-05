import { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription } from '../types';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

/* ── Inline Material Symbol helper ── */
const MIcon = ({ name, size = 16 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size }}>{name}</span>
);

interface DashboardProps {
  products: Product[];
  incomeEntries: IncomeEntry[];
  expenses: Expense[];
  businessSubscriptions: BusinessSubscription[];
  customerSubscriptions: CustomerSubscription[];
  currency: string;
}

export default function Dashboard({
  products,
  incomeEntries,
  expenses,
  businessSubscriptions,
  customerSubscriptions,
  currency,
}: DashboardProps) {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

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

  // Budget Goals (Standardized categories)
  const budgetCategories = [
    { label: 'Housing', tag: 'housing', target: 2000, color: '#1152d4' },
    { label: 'Food', tag: 'food', target: 800, color: '#10b981' },
    { label: 'Entertainment', tag: 'ent', target: 500, color: '#f59e0b' }
  ];

  const getSpending = (tag: string) => expenses.filter(e => e.category.toLowerCase().includes(tag)).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="dashboard-v2">
      {/* KPI Cards section */}
      <div className="kpi-row-v2">
        <div className="kpi-card-v2">
          <div className="kpi-card-icon-bg"><MIcon name="account_balance" size={48} /></div>
          <h3>Total Balance</h3>
          <p className="value">{formatCurrency(metrics.totalBalance, currency)}</p>
          <div className="trend-badge trend-up"><MIcon name="trending_up" size={14} /><span>+5.2%</span></div>
        </div>
        <div className="kpi-card-v2">
          <div className="kpi-card-icon-bg"><MIcon name="payments" size={48} /></div>
          <h3>Monthly Income</h3>
          <p className="value">{formatCurrency(metrics.currIncome, currency)}</p>
          <div className={`trend-badge ${metrics.incomeTrend >= 0 ? 'trend-up' : 'trend-down'}`}>
            <MIcon name={metrics.incomeTrend >= 0 ? 'trending_up' : 'trending_down'} size={14} />
            <span>{metrics.incomeTrend >= 0 ? '+' : ''}{metrics.incomeTrend.toFixed(1)}%</span>
          </div>
        </div>
        <div className="kpi-card-v2">
          <div className="kpi-card-icon-bg"><MIcon name="credit_card" size={48} /></div>
          <h3>Monthly Expenses</h3>
          <p className="value">{formatCurrency(metrics.currExpenses, currency)}</p>
          <div className={`trend-badge ${metrics.expenseTrend <= 0 ? 'trend-up' : 'trend-down'}`}>
            <MIcon name={metrics.expenseTrend <= 0 ? 'trending_down' : 'trending_up'} size={14} />
            <span>{metrics.expenseTrend >= 0 ? '+' : ''}{metrics.expenseTrend.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Chart & Recent Transactions */}
      <div className="dashboard-split-grid">
        <section className="dashboard-section-v2" style={{ minWidth: 0 }}>
          <h2>Income vs Expenses <button className="btn btn-ghost" style={{ fontSize: 'var(--font-xs)', padding: '4px 8px' }} onClick={() => setIsExporting(!isExporting)}>This Month</button></h2>
          <div style={{ width: '100%', height: 300, minWidth: 0 }}>
            {metrics.chartData && metrics.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="chartBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="var(--accent)" fillOpacity={1} fill="url(#chartBlue)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expenses" stroke="var(--text-muted)" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No chart data available
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-section-v2">
          <h2>Recent Transactions <button className="btn btn-ghost" style={{ fontSize: 'var(--font-xs)', padding: '4px 8px' }}>View All</button></h2>
          <div className="transaction-list-v2">
            {metrics.recent.length === 0 ? (
              <p className="empty-state">{t.noIncomeEntriesYet}</p>
            ) : metrics.recent.map(tx => (
              <div key={tx.id} className="transaction-item-v2">
                <div className="transaction-icon-v2"><MIcon name={tx.type === 'income' ? 'arrow_downward' : 'arrow_upward'} /></div>
                <div className="transaction-info-v2">
                  <p className="transaction-title-v2">{tx.type === 'income' ? products.find(p => p.id === (tx as IncomeEntry).productId)?.name || 'Income' : (tx as Expense).description}</p>
                  <p className="transaction-meta-v2">{tx.type === 'income' ? 'Sales' : (tx as Expense).category} • {new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <div className={`transaction-amount-v2 ${tx.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Monthly Budget Goals */}
      <section className="dashboard-section-v2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ margin: 0 }}>Monthly Budget Goals</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Total Budget: <strong style={{ color: 'var(--text)' }}>$3,500</strong></span>
        </div>
        <div className="budget-goals-v2">
          {budgetCategories.map(cat => {
            const actual = getSpending(cat.tag);
            const pct = Math.min(100, (actual / cat.target) * 100);
            return (
              <div key={cat.label} className="budget-item-v2">
                <div className="budget-info">
                  <span className="budget-label">{cat.label}</span>
                  <span className="budget-stats"><span className="budget-pct" style={{ color: pct > 90 ? 'var(--error)' : 'inherit' }}>{pct.toFixed(0)}%</span> {`(${formatCurrency(actual, currency)} / ${formatCurrency(cat.target, currency)})`}</span>
                </div>
                <div className="progress-track-v2"><div className="progress-fill-v2" style={{ width: `${pct}%`, background: cat.color }} /></div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
