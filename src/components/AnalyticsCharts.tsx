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
import { IncomeEntry, Product } from '../types';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

interface AnalyticsChartsProps {
    incomeEntries: IncomeEntry[];
    products: Product[];
    currency: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#6366f1'];

export default function AnalyticsCharts({ incomeEntries, products, currency }: AnalyticsChartsProps) {
    const { t } = useLanguage();

    const chartData = useMemo(() => {
        // 1. Daily Revenue (for Area Chart)
        if (!incomeEntries || incomeEntries.length === 0) return { dailyData: [], productData: [], salesData: [] };

        const dailyMap = incomeEntries.reduce((acc, entry) => {
            acc[entry.date] = (acc[entry.date] || 0) + entry.amount;
            return acc;
        }, {} as Record<string, number>);

        // Sort dates and take last 30 days if available, or just all
        const sortedDates = Object.keys(dailyMap).sort();
        const dailyData = sortedDates.map((date) => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            revenue: dailyMap[date],
        }));

        // 2. Product Performance (for Bar Chart)
        const productMap = incomeEntries.reduce((acc, entry) => {
            acc[entry.productId] = (acc[entry.productId] || 0) + entry.amount;
            return acc;
        }, {} as Record<string, number>);

        const productData = Object.entries(productMap)
            .map(([id, revenue]) => ({
                name: products.find((p) => p.id === id)?.name || t.unknown,
                revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // 3. Sales Distribution (for Pie Chart)
        const salesMap = incomeEntries.reduce((acc, entry) => {
            acc[entry.productId] = (acc[entry.productId] || 0) + entry.quantity;
            return acc;
        }, {} as Record<string, number>);

        const salesData = Object.entries(salesMap)
            .map(([id, quantity]) => ({
                name: products.find((p) => p.id === id)?.name || t.unknown,
                value: quantity,
            }))
            .sort((a, b) => b.value - a.value);

        return { dailyData, productData, salesData };
    }, [incomeEntries, products, t]);

    if (incomeEntries.length === 0) {
        return null;
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)'
                }}>
                    <p className="label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
                    <p className="intro" style={{ color: 'var(--accent)' }}>
                        {payload[0].name === 'value' ? t.quantity : t.revenue}: {
                            payload[0].name === 'revenue' || payload[0].dataKey === 'revenue'
                                ? formatCurrency(payload[0].value, currency)
                                : payload[0].value
                        }
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="analytics-charts-container">
            <div className="chart-section">
                <h3>{t.revenueVsExpenses}</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--text-muted)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area type="monotone" dataKey="revenue" stroke="var(--accent)" fillOpacity={1} fill="url(#colorRevenue)" />
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
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)', opacity: 0.4 }} />
                                <Bar dataKey="revenue" fill="var(--accent)" radius={[0, 4, 4, 0]}>
                                    {chartData.productData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
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
                                <Pie
                                    data={chartData.salesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.salesData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
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
