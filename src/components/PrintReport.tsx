import { formatCurrency } from '../utils/currency';
import { PeriodReport, ReportPeriod } from '../utils/reporting';
import { useLanguage } from '../context/LanguageContext';

interface PrintReportProps {
  report: PeriodReport;
  currency: string;
  period: ReportPeriod;
}

export default function PrintReport({ report, currency, period }: PrintReportProps) {
  const { t } = useLanguage();
  const periodLabel = t[period];

  return (
    <section className="print-report" aria-label={t.printReport}>
      <h1>{t.financialSummary}</h1>
      <p>{periodLabel}: {report.range.start || t.allTime} {report.range.end && `– ${report.range.end}`}</p>
      <div className="print-summary-grid">
        <div><span>{t.totalRevenue}</span><strong>{formatCurrency(report.totalRevenueMinor, currency)}</strong></div>
        <div><span>{t.totalExpenses}</span><strong>{formatCurrency(report.totalExpensesMinor, currency)}</strong></div>
        <div><span>{t.netProfit}</span><strong>{formatCurrency(report.netProfitMinor, currency)}</strong></div>
      </div>
      <h2>{t.recentActivity}</h2>
      <ul>
        {report.recentActivity.map((activity) => (
          <li key={activity.id}>{activity.date} — {activity.label}: {formatCurrency(activity.amountMinor, currency)}</li>
        ))}
      </ul>
    </section>
  );
}
