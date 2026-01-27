interface DailyStats {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalItems: number;
}

const DAILY_STATS_KEY = 'income-tracker-daily-stats';
const LAST_RESET_DATE_KEY = 'income-tracker-last-reset-date';

export const dailyStatsStorage = {
  getLastResetDate(): string | null {
    return localStorage.getItem(LAST_RESET_DATE_KEY);
  },

  setLastResetDate(date: string): void {
    localStorage.setItem(LAST_RESET_DATE_KEY, date);
  },

  getDailyStats(): Record<string, DailyStats> {
    const data = localStorage.getItem(DAILY_STATS_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveDailyStats(stats: Record<string, DailyStats>): void {
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
  },

  getTodayStats(): DailyStats {
    const today = new Date().toISOString().split('T')[0];
    const allStats = this.getDailyStats();
    return allStats[today] || { date: today, totalSales: 0, totalRevenue: 0, totalItems: 0 };
  },

  updateTodayStats(update: Partial<DailyStats>): void {
    const today = new Date().toISOString().split('T')[0];
    const allStats = this.getDailyStats();
    const todayStats = this.getTodayStats();
    
    allStats[today] = {
      ...todayStats,
      ...update,
      date: today,
    };
    
    this.saveDailyStats(allStats);
  },

  resetIfNewDay(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = this.getLastResetDate();
    
    if (lastReset !== today) {
      // New day - reset today's stats
      const allStats = this.getDailyStats();
      allStats[today] = {
        date: today,
        totalSales: 0,
        totalRevenue: 0,
        totalItems: 0,
      };
      this.saveDailyStats(allStats);
      this.setLastResetDate(today);
    }
  },

  addSale(revenue: number, items: number): void {
    this.resetIfNewDay();
    const todayStats = this.getTodayStats();
    this.updateTodayStats({
      totalSales: todayStats.totalSales + 1,
      totalRevenue: todayStats.totalRevenue + revenue,
      totalItems: todayStats.totalItems + items,
    });
  },
};

// Initialize on import
dailyStatsStorage.resetIfNewDay();

