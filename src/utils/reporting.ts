import { Expense, IncomeEntry, Product } from '../types';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'allTime';

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface TopProductSummary {
  productId: string;
  name: string;
  revenueMinor: number;
  quantity: number;
}

export interface ActivitySummary {
  id: string;
  kind: 'sale' | 'expense';
  date: string;
  amountMinor: number;
  label: string;
}

export interface PeriodReport {
  range: DateRange;
  incomeEntries: IncomeEntry[];
  expenses: Expense[];
  totalRevenueMinor: number;
  totalExpensesMinor: number;
  netProfitMinor: number;
  totalItems: number;
  topProducts: TopProductSummary[];
  recentActivity: ActivitySummary[];
}

function dateOnly(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

function addDays(date: string, amount: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return dateOnly(value);
}

export function getDateRange(period: ReportPeriod, anchorDate = dateOnly(new Date())): DateRange {
  if (period === 'allTime') return { start: null, end: null };
  if (period === 'daily') return { start: anchorDate, end: anchorDate };
  if (period === 'weekly') return { start: addDays(anchorDate, -6), end: anchorDate };
  if (period === 'monthly') {
    const monthStart = `${anchorDate.slice(0, 7)}-01`;
    const monthEnd = new Date(`${monthStart}T00:00:00.000Z`);
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1, 0);
    return { start: monthStart, end: dateOnly(monthEnd) };
  }

  return { start: `${anchorDate.slice(0, 4)}-01-01`, end: `${anchorDate.slice(0, 4)}-12-31` };
}

function inRange(date: string, range: DateRange): boolean {
  return (!range.start || date >= range.start) && (!range.end || date <= range.end);
}

export function buildPeriodReport(
  incomeEntries: IncomeEntry[],
  expenses: Expense[],
  products: Product[],
  period: ReportPeriod,
  anchorDate?: string,
): PeriodReport {
  const range = getDateRange(period, anchorDate);
  const filteredIncome = incomeEntries.filter((entry) => inRange(entry.date, range));
  const filteredExpenses = expenses.filter((expense) => inRange(expense.date, range));
  const productNames = new Map(products.map((product) => [product.id, product.name]));
  const productTotals = new Map<string, TopProductSummary>();

  filteredIncome.forEach((entry) => {
    const current = productTotals.get(entry.productId) || {
      productId: entry.productId,
      name: productNames.get(entry.productId) || 'Unknown',
      revenueMinor: 0,
      quantity: 0,
    };
    current.revenueMinor += entry.amountMinor;
    current.quantity += entry.quantity;
    productTotals.set(entry.productId, current);
  });

  const recentActivity: ActivitySummary[] = [
    ...filteredIncome.map((entry) => ({
      id: entry.id,
      kind: 'sale' as const,
      date: entry.date,
      amountMinor: entry.amountMinor,
      label: productNames.get(entry.productId) || 'Unknown',
    })),
    ...filteredExpenses.map((expense) => ({
      id: expense.id,
      kind: 'expense' as const,
      date: expense.date,
      amountMinor: expense.amountMinor,
      label: expense.description,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 10);

  const totalRevenueMinor = filteredIncome.reduce((sum, entry) => sum + entry.amountMinor, 0);
  const totalExpensesMinor = filteredExpenses.reduce((sum, expense) => sum + expense.amountMinor, 0);

  return {
    range,
    incomeEntries: filteredIncome,
    expenses: filteredExpenses,
    totalRevenueMinor,
    totalExpensesMinor,
    netProfitMinor: totalRevenueMinor - totalExpensesMinor,
    totalItems: filteredIncome.reduce((sum, entry) => sum + entry.quantity, 0),
    topProducts: Array.from(productTotals.values())
      .sort((a, b) => b.revenueMinor - a.revenueMinor || a.name.localeCompare(b.name))
      .slice(0, 5),
    recentActivity,
  };
}

export function groupReportAmounts(
  report: Pick<PeriodReport, 'incomeEntries' | 'expenses'>,
  period: ReportPeriod,
): Array<{ name: string; revenueMinor: number; expensesMinor: number }> {
  const grouped = new Map<string, { revenueMinor: number; expensesMinor: number }>();
  const keyFor = (date: string) => {
    if (period === 'daily') return date;
    if (period === 'weekly') return date;
    if (period === 'yearly') return date.slice(0, 4);
    return date.slice(0, 7);
  };

  report.incomeEntries.forEach((entry) => {
    const key = keyFor(entry.date);
    const current = grouped.get(key) || { revenueMinor: 0, expensesMinor: 0 };
    current.revenueMinor += entry.amountMinor;
    grouped.set(key, current);
  });
  report.expenses.forEach((expense) => {
    const key = keyFor(expense.date);
    const current = grouped.get(key) || { revenueMinor: 0, expensesMinor: 0 };
    current.expensesMinor += expense.amountMinor;
    grouped.set(key, current);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, values]) => ({ name, ...values }));
}
