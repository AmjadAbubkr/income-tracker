import * as XLSX from 'xlsx';
import { Product } from '../types';
import { formatCurrency, getCurrency } from './currency';
import { PeriodReport, ReportPeriod } from './reporting';

function labelForPeriod(period: ReportPeriod): string {
  if (period === 'daily') return 'Daily';
  if (period === 'monthly') return 'Monthly';
  if (period === 'weekly') return 'Weekly';
  if (period === 'yearly') return 'Yearly';
  return 'All_Time';
}

export function buildExportWorkbook(
  report: PeriodReport,
  products: Product[],
  currency: string,
  period: ReportPeriod,
): XLSX.WorkBook {
  const currencyInfo = getCurrency(currency);
  const periodLabel = labelForPeriod(period);
  const productNames = new Map(products.map((product) => [product.id, product.name]));
  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Financial Report Summary'],
    ['Period', periodLabel],
    ['Start', report.range.start || 'All time'],
    ['End', report.range.end || 'All time'],
    ['Currency', `${currencyInfo.symbol} ${currencyInfo.code}`],
    [],
    ['Revenue', formatCurrency(report.totalRevenueMinor, currency)],
    ['Expenses', formatCurrency(report.totalExpensesMinor, currency)],
    ['Net Profit', formatCurrency(report.netProfitMinor, currency)],
    ['Items Sold', report.totalItems],
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const salesSheet = XLSX.utils.aoa_to_sheet([
    ['Date', 'Product', 'Quantity', 'Total Amount', 'Notes'],
    ...report.incomeEntries.map((entry) => [
      entry.date,
      productNames.get(entry.productId) || 'Unknown',
      entry.quantity,
      formatCurrency(entry.amountMinor, currency),
      entry.notes || '',
    ]),
  ]);
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales');

  const expensesSheet = XLSX.utils.aoa_to_sheet([
    ['Date', 'Category', 'Description', 'Amount'],
    ...report.expenses.map((expense) => [
      expense.date,
      expense.category,
      expense.description,
      formatCurrency(expense.amountMinor, currency),
    ]),
  ]);
  XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

  const performanceSheet = XLSX.utils.aoa_to_sheet([
    ['Product', 'Revenue', 'Items Sold'],
    ...report.topProducts.map((product) => [
      product.name,
      formatCurrency(product.revenueMinor, currency),
      product.quantity,
    ]),
  ]);
  XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Product Performance');

  return workbook;
}

export async function exportToExcel(
  report: PeriodReport,
  products: Product[],
  currency: string,
  period: ReportPeriod,
): Promise<void> {
  if (report.incomeEntries.length === 0 && report.expenses.length === 0) {
    alert('No financial data found for the selected period.');
    return;
  }

  const workbook = buildExportWorkbook(report, products, currency, period);
  const datePart = report.range.start?.replace(/-/g, '') || 'all';
  XLSX.writeFile(workbook, `IncomeTrack_Report_${labelForPeriod(period)}_${datePart}.xlsx`);
}
