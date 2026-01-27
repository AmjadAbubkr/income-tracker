export const calculateNextBillingDate = (currentDateStr: string, billingCycle: 'monthly' | 'yearly'): string => {
    const date = new Date(currentDateStr);
    if (isNaN(date.getTime())) return currentDateStr;

    if (billingCycle === 'monthly') {
        date.setMonth(date.getMonth() + 1);
    } else {
        date.setFullYear(date.getFullYear() + 1);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
