export const calculateNextBillingDate = (currentDateStr: string, billingCycle: 'monthly' | 'yearly'): string => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(currentDateStr);
    if (!match) return currentDateStr;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const lastDayOfCurrentMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (month < 1 || month > 12 || day < 1 || day > lastDayOfCurrentMonth) return currentDateStr;

    const targetYear = billingCycle === 'monthly' ? year + (month === 12 ? 1 : 0) : year + 1;
    const targetMonth = billingCycle === 'monthly' ? (month % 12) + 1 : month;
    const targetLastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
    // A billing schedule created on a month-end continues to bill on each future month-end.
    const targetDay = day === lastDayOfCurrentMonth ? targetLastDay : Math.min(day, targetLastDay);

    return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
};
