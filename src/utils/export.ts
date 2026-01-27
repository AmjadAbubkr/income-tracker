import * as XLSX from 'xlsx';
import { IncomeEntry, Product } from '../types';
import { formatCurrency, getCurrency } from './currency';

interface ExportData {
  entries: IncomeEntry[];
  products: Product[];
  currency: string;
  period: string;
  analytics: {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    averageSale: number;
    topProduct: { name: string; sales: number; revenue: number } | null;
  };
}

export async function exportToExcel(
  entries: IncomeEntry[],
  products: Product[],
  currency: string,
  period: 'daily' | 'monthly',
  date?: string
): Promise<void> {
  const currencyInfo = getCurrency(currency);
  const periodLabel = period === 'daily' ? 'Daily' : 'Monthly';
  const periodDate = date || (period === 'daily' ? new Date().toISOString().split('T')[0] : new Date().toISOString().slice(0, 7));

  // Filter entries based on period
  let filteredEntries: IncomeEntry[];
  if (period === 'daily') {
    filteredEntries = entries.filter((e) => e.date === periodDate);
  } else {
    // Monthly - filter by year-month
    filteredEntries = entries.filter((e) => e.date.startsWith(periodDate));
  }

  if (filteredEntries.length === 0) {
    alert(`No sales data found for the selected ${period} period.`);
    return;
  }

  // Calculate analytics
  const analytics = calculateAnalytics(filteredEntries, products);

  // Create workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData = [
    ['Sales Report Summary'],
    [''],
    ['Period', periodLabel],
    ['Date', periodDate],
    ['Currency', `${currencyInfo.symbol} ${currencyInfo.code}`],
    [''],
    ['Analytics'],
    ['Total Sales', analytics.totalSales],
    ['Total Revenue', formatCurrency(analytics.totalRevenue, currency)],
    ['Total Items Sold', analytics.totalItems],
    ['Average Sale Value', formatCurrency(analytics.averageSale, currency)],
    [''],
    analytics.topProduct
      ? [
        'Top Product',
        analytics.topProduct.name,
        `Sales: ${analytics.topProduct.sales}`,
        `Revenue: ${formatCurrency(analytics.topProduct.revenue, currency)}`,
      ]
      : ['Top Product', 'N/A'],
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // 2. Sales Data Sheet
  const salesData: (string | number)[][] = [
    [
      'Date',
      'Product Name',
      'Product Price',
      'Quantity',
      'Unit Price',
      'Total Amount',
      'Notes',
    ],
  ];

  filteredEntries.forEach((entry) => {
    const product = products.find((p) => p.id === entry.productId);
    salesData.push([
      entry.date,
      product?.name || 'Unknown',
      formatCurrency(product?.price || 0, currency),
      entry.quantity,
      formatCurrency((product?.price || 0), currency),
      formatCurrency(entry.amount, currency),
      entry.notes || '',
    ]);
  });

  const salesWs = XLSX.utils.aoa_to_sheet(salesData);

  // Set column widths
  salesWs['!cols'] = [
    { wch: 12 }, // Date
    { wch: 20 }, // Product Name
    { wch: 15 }, // Product Price
    { wch: 10 }, // Quantity
    { wch: 15 }, // Unit Price
    { wch: 15 }, // Total Amount
    { wch: 30 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, salesWs, 'Sales Data');

  // 3. Product Performance Sheet
  const productPerformance: Record<string, { name: string; sales: number; revenue: number; items: number }> = {};

  filteredEntries.forEach((entry) => {
    const product = products.find((p) => p.id === entry.productId);
    if (!product) return;

    if (!productPerformance[entry.productId]) {
      productPerformance[entry.productId] = {
        name: product.name,
        sales: 0,
        revenue: 0,
        items: 0,
      };
    }

    productPerformance[entry.productId].sales += 1;
    productPerformance[entry.productId].revenue += entry.amount;
    productPerformance[entry.productId].items += entry.quantity;
  });

  const performanceData: (string | number)[][] = [
    ['Product Name', 'Number of Sales', 'Total Revenue', 'Items Sold', 'Average Sale Value'],
  ];

  Object.values(productPerformance).forEach((perf) => {
    performanceData.push([
      perf.name,
      perf.sales,
      formatCurrency(perf.revenue, currency),
      perf.items,
      formatCurrency(perf.revenue / perf.sales, currency),
    ]);
  });

  const performanceWs = XLSX.utils.aoa_to_sheet(performanceData);
  performanceWs['!cols'] = [
    { wch: 20 }, // Product Name
    { wch: 15 }, // Number of Sales
    { wch: 15 }, // Total Revenue
    { wch: 12 }, // Items Sold
    { wch: 18 }, // Average Sale Value
  ];

  XLSX.utils.book_append_sheet(wb, performanceWs, 'Product Performance');

  // 4. Daily Breakdown (for monthly reports)
  if (period === 'monthly') {
    const dailyBreakdown: Record<string, { sales: number; revenue: number; items: number }> = {};

    filteredEntries.forEach((entry) => {
      if (!dailyBreakdown[entry.date]) {
        dailyBreakdown[entry.date] = {
          sales: 0,
          revenue: 0,
          items: 0,
        };
      }
      dailyBreakdown[entry.date].sales += 1;
      dailyBreakdown[entry.date].revenue += entry.amount;
      dailyBreakdown[entry.date].items += entry.quantity;
    });

    const dailyData: (string | number)[][] = [
      ['Date', 'Number of Sales', 'Total Revenue', 'Items Sold', 'Average Sale Value'],
    ];

    Object.entries(dailyBreakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, data]) => {
        dailyData.push([
          date,
          data.sales,
          formatCurrency(data.revenue, currency),
          data.items,
          formatCurrency(data.revenue / data.sales, currency),
        ]);
      });

    const dailyWs = XLSX.utils.aoa_to_sheet(dailyData);
    dailyWs['!cols'] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Number of Sales
      { wch: 15 }, // Total Revenue
      { wch: 12 }, // Items Sold
      { wch: 18 }, // Average Sale Value
    ];

    XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Breakdown');
  }

  // Generate filename
  const dateStr = periodDate.replace(/-/g, '');
  const filename = `Sales_Report_${periodLabel}_${dateStr}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);
}

function calculateAnalytics(
  entries: IncomeEntry[],
  products: Product[]
): ExportData['analytics'] {
  const totalSales = entries.length;
  const totalRevenue = entries.reduce((sum, e) => sum + e.amount, 0);
  const totalItems = entries.reduce((sum, e) => sum + e.quantity, 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Find top product
  const productStats: Record<string, { name: string; sales: number; revenue: number }> = {};

  entries.forEach((entry) => {
    const product = products.find((p) => p.id === entry.productId);
    if (!product) return;

    if (!productStats[entry.productId]) {
      productStats[entry.productId] = {
        name: product.name,
        sales: 0,
        revenue: 0,
      };
    }

    productStats[entry.productId].sales += 1;
    productStats[entry.productId].revenue += entry.amount;
  });

  const topProduct = Object.values(productStats).reduce(
    (top, current) => (current.revenue > (top?.revenue || 0) ? current : top),
    null as { name: string; sales: number; revenue: number } | null
  );

  return {
    totalSales,
    totalRevenue,
    totalItems,
    averageSale,
    topProduct,
  };
}

