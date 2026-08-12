import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Expense, IncomeEntry, Product } from '../types';
import { formatCurrency } from '../utils/currency';
import { groupReportAmounts, type ReportPeriod } from '../utils/reporting';
import { useLanguage } from '../context/LanguageContext';

interface AnalyticsChartsProps {
  incomeEntries: IncomeEntry[];
  expenses: Expense[];
  products: Product[];
  currency: string;
  viewMode: ReportPeriod;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#6366f1'];

interface TooltipPayloadItem {
  name: string;
  value: number;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export default function AnalyticsCharts({ incomeEntries, expenses, products, currency, viewMode }: AnalyticsChartsProps) {
  const { t } = useLanguage();
  const chartData = useMemo(() => {
    const productNames = new Map(products.map((product) => [product.id, product.name]));
    const productMap = new Map<string, { name: string; revenue: number; quantity: number }>();
    incomeEntries.forEach((entry) => {
      const current = productMap.get(entry.productId) || {
        name: productNames.get(entry.productId) || t.unknown,
        revenue: 0,
        quantity: 0,
      };
      current.revenue += entry.amountMinor;
      current.quantity += entry.quantity;
      productMap.set(entry.productId, current);
    });

    const salesData = Array.from(productMap.values())
      .map(({ name, quantity }) => ({ name, value: quantity }))
      .sort((a, b) => b.value - a.value);

    return {
      timeSeriesData: groupReportAmounts({ incomeEntries, expenses }, viewMode)
        .map(({ name, revenueMinor, expensesMinor }) => ({
          date: name,
          revenue: revenueMinor,
          expenses: expensesMinor,
        })),
      productData: Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
      salesData,
    };
  }, [expenses, incomeEntries, products, t.unknown, viewMode]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((item) => (
          <p key={item.dataKey || item.name}>
            {item.dataKey === 'expenses' ? t.totalExpenses : t.totalRevenue}: {formatCurrency(item.value, currency)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="analytics-charts-container">
      <div className="chart-section">
        <h3>{t.revenueVsExpenses}</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value, currency)} />
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--accent)" fillOpacity={1} fill="url(#analyticsRevenue)" />
              <Area type="monotone" dataKey="expenses" stroke="var(--error)" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid-row">
        <div className="chart-section half-width">
          <h3>{t.topProducts}</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.productData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Bar dataKey="revenue" fill="var(--accent)" radius={[0, 4, 4, 0]}>
                  {chartData.productData.map((item) => <Cell key={item.name} fill={COLORS[chartData.productData.indexOf(item) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section half-width">
          <h3>{t.revenueByCategory}</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData.salesData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.salesData.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
