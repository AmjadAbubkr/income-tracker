import { useState, useEffect } from 'react';
import { Product, IncomeEntry, ProductWithIncome } from '../types';
import { formatCurrency } from '../utils/currency';
import { exportToExcel } from '../utils/export';
import { dailyStatsStorage } from '../utils/dailyStats';

// SVG Icons
const BarChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

interface DashboardProps {
  products: Product[];
  incomeEntries: IncomeEntry[];
  onDeleteProduct: (id: string) => void;
  onDeleteIncome: (id: string) => void;
  currency: string;
  todayDate?: string;
  currentMonth?: string;
}

import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({
  products,
  incomeEntries,
  onDeleteProduct,
  onDeleteIncome,
  currency,
  todayDate,
}: DashboardProps) {
  const { t } = useLanguage();
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyDate, setMonthlyDate] = useState(new Date().toISOString().slice(0, 7));
  const [isExporting, setIsExporting] = useState(false);

  // Daily stats state
  const [dailyStats, setDailyStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalItems: 0,
  });

  // Refresh daily stats when income entries change or date changes
  useEffect(() => {
    dailyStatsStorage.resetIfNewDay();
    const stats = dailyStatsStorage.getTodayStats();
    setDailyStats({
      totalSales: stats.totalSales,
      totalRevenue: stats.totalRevenue,
      totalItems: stats.totalItems,
    });
  }, [incomeEntries, todayDate]);

  const handleDailyExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(incomeEntries, products, currency, 'daily', dailyDate);
    } catch (error) {
      console.error('Export error:', error);
      alert(t.failedToExportDaily);
    } finally {
      setIsExporting(false);
    }
  };

  const handleMonthlyExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(incomeEntries, products, currency, 'monthly', monthlyDate);
    } catch (error) {
      console.error('Export error:', error);
      alert(t.failedToExportMonthly);
    } finally {
      setIsExporting(false);
    }
  };

  const getProductsWithIncome = (): ProductWithIncome[] => {
    return products.map((product) => {
      const entries = incomeEntries.filter((e) => e.productId === product.id);
      const totalIncome = entries.reduce((sum, e) => sum + e.amount, 0);
      const totalQuantity = entries.reduce((sum, e) => sum + e.quantity, 0);
      const lastSaleDate = entries.length > 0
        ? entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : undefined;

      return {
        ...product,
        totalIncome,
        totalQuantity,
        lastSaleDate,
      };
    });
  };

  const productsWithIncome = getProductsWithIncome();
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalSales = incomeEntries.length;
  const totalItemsSold = incomeEntries.reduce((sum, e) => sum + e.quantity, 0);

  const recentEntries = [...incomeEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || t.unknown;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t.incomeDashboard}</h1>
        <div className="export-section">
          <div className="export-controls">
            <div className="export-group">
              <label htmlFor="daily-date">{t.dailyExport}:</label>
              <input
                id="daily-date"
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="export-date-input"
              />
              <button
                onClick={handleDailyExport}
                disabled={isExporting}
                className="btn-export"
                title={t.exportDailySalesToExcel}
              >
                <BarChartIcon /> {isExporting ? t.exporting : t.exportDaily}
              </button>
            </div>
            <div className="export-group">
              <label htmlFor="monthly-date">{t.monthlyExport}:</label>
              <input
                id="monthly-date"
                type="month"
                value={monthlyDate}
                onChange={(e) => setMonthlyDate(e.target.value)}
                className="export-date-input"
              />
              <button
                onClick={handleMonthlyExport}
                disabled={isExporting}
                className="btn-export"
                title={t.exportMonthlySalesToExcel}
              >
                <TrendingUpIcon /> {isExporting ? t.exporting : t.exportMonthly}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Stats - Resets Daily */}
      <div className="daily-stats-section">
        <h2 className="daily-stats-title">
          <span className="daily-stats-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          {t.todaysStats}
          <span className="daily-stats-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </h2>
        <div className="stats-grid daily-stats-grid">
          <div className="stat-card daily-stat-card">
            <h3>{t.todaysRevenue}</h3>
            <p className="stat-value">{formatCurrency(dailyStats.totalRevenue, currency)}</p>
          </div>
          <div className="stat-card daily-stat-card">
            <h3>{t.todaysSales}</h3>
            <p className="stat-value">{dailyStats.totalSales}</p>
          </div>
          <div className="stat-card daily-stat-card">
            <h3>{t.itemsSoldToday}</h3>
            <p className="stat-value">{dailyStats.totalItems}</p>
          </div>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{t.totalIncome}</h3>
          <p className="stat-value">{formatCurrency(totalIncome, currency)}</p>
        </div>
        <div className="stat-card">
          <h3>{t.totalSales}</h3>
          <p className="stat-value">{totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>{t.itemsSold}</h3>
          <p className="stat-value">{totalItemsSold}</p>
        </div>
        <div className="stat-card">
          <h3>{t.products}</h3>
          <p className="stat-value">{products.length}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="products-section">
          <h2>{t.productsOverview}</h2>
          {productsWithIncome.length === 0 ? (
            <p className="empty-state">{t.noProductsAddedYet}</p>
          ) : (
            <div className="products-list">
              {productsWithIncome.map((product) => (
                <div key={product.id} className="product-card">
                  {product.image && (
                    <div className="product-image-container">
                      <img src={product.image} alt={product.name} className="product-image" />
                    </div>
                  )}
                  <div className="product-header">
                    <h3>{product.name}</h3>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="btn-delete"
                      title={t.deleteProduct}
                    >
                      ×
                    </button>
                  </div>
                  <p className="product-price">{t.price}: {formatCurrency(product.price, currency)}</p>
                  {product.description && (
                    <p className="product-description">{product.description}</p>
                  )}
                  <div className="product-stats">
                    <span>{t.income}: {formatCurrency(product.totalIncome, currency)}</span>
                    <span>{t.sold}: {product.totalQuantity}</span>
                    {product.lastSaleDate && (
                      <span>{t.lastSale}: {new Date(product.lastSaleDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="recent-entries-section">
          <h2>{t.recentIncomeEntries}</h2>
          {recentEntries.length === 0 ? (
            <p className="empty-state">{t.noIncomeEntriesYet}</p>
          ) : (
            <div className="entries-list">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <h4>{getProductName(entry.productId)}</h4>
                    <button
                      onClick={() => onDeleteIncome(entry.id)}
                      className="btn-delete"
                      title={t.deleteEntry}
                    >
                      ×
                    </button>
                  </div>
                  <div className="entry-details">
                    <span>{t.quantity}: {entry.quantity}</span>
                    <span>{t.amount}: {formatCurrency(entry.amount, currency)}</span>
                    <span>{t.date}: {new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  {entry.notes && <p className="entry-notes">{entry.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

