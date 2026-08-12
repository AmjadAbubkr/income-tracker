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
    viewMode: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#6366f1'];

/**
 * Recharts passes tooltip data with this shape.
 * Typed explicitly so we don't need to use `any`.
 */
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

export default function AnalyticsCharts({ incomeEntries, products, currency, viewMode }: AnalyticsChartsProps) {
    const { t } = useLanguage();

    const chartData = useMemo(() => {
        if (!incomeEntries || incomeEntries.length === 0) return { dailyData: [], productData: [], salesData: [] };

        let timeSeriesData: { date: string; revenue: number }[] = [];

        if (viewMode === 'daily') {
            const dailyMap = incomeEntries.reduce((acc, entry) => {
                acc[entry.date] = (acc[entry.date] || 0) + entry.amountMinor;
                return acc;
            }, {} as Record<string, number>);

            const sortedDates = Object.keys(dailyMap).sort();
            timeSeriesData = sortedDates.map((date) => ({
                date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                revenue: dailyMap[date],
            })).slice(-30);
        } else if (viewMode === 'weekly') {
            const weeklyMap: Record<string, number> = {};
            incomeEntries.forEach((entry) => {
                const date = new Date(entry.date);
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                const weekKey = weekStart.toISOString().split('T')[0];
                weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + entry.amountMinor;
            });

            const sortedWeeks = Object.keys(weeklyMap).sort();
            timeSeriesData = sortedWeeks.map((weekKey) => ({
                date: new Date(weekKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                revenue: weeklyMap[weekKey],
            })).slice(-12);
        } else if (viewMode === 'monthly') {
            const monthlyMap: Record<string, number> = {};
            incomeEntries.forEach((entry) => {
                const date = new Date(entry.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + entry.amountMinor;
            });

            const sortedMonths = Object.keys(monthlyMap).sort();
            timeSeriesData = sortedMonths.map((monthKey) => ({
                date: new Date(monthKey + '-01').toLocaleDateString(undefined, { year: '2-digit', month: 'short' }),
                revenue: monthlyMap[monthKey],
            })).slice(-12);
        } else if (viewMode === 'yearly') {
            const yearlyMap: Record<string, number> = {};
            incomeEntries.forEach((entry) => {
                const date = new Date(entry.date);
                const yearKey = date.getFullYear().toString();
                yearlyMap[yearKey] = (yearlyMap[yearKey] || 0) + entry.amountMinor;
            });

            const sortedYears = Object.keys(yearlyMap).sort();
            timeSeriesData = sortedYears.map((yearKey) => ({
                date: yearKey,
                revenue: yearlyMap[yearKey],
            }));
        }

        // Top 5 products by revenue
        const productMap = incomeEntries.reduce((acc, entry) => {
            acc[entry.productId] = (acc[entry.productId] || 0) + entry.amountMinor;
            return acc;
        }, {} as Record<string, number>);

        const productData = Object.entries(productMap)
            .map(([id, revenue]) => ({
                name: products.find((p) => p.id === id)?.name || t.unknown,
                revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Sales quantity distribution for pie chart
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

        return { dailyData: timeSeriesData, productData, salesData };
    }, [incomeEntries, products, viewMode, t]);

    if (incomeEntries.length === 0) {
        return null;
    }

    /**
     * Custom tooltip component for Recharts.
     * Typed with CustomTooltipProps instead of `any` to maintain strict mode.
     */
    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
