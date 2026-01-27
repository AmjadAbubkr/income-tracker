export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
];

const CURRENCY_KEY = 'income-tracker-currency';
const DEFAULT_CURRENCY = 'USD';

export const currencyStorage = {
  getCurrency(): string {
    const stored = localStorage.getItem(CURRENCY_KEY);
    return stored || DEFAULT_CURRENCY;
  },

  saveCurrency(currencyCode: string): void {
    localStorage.setItem(CURRENCY_KEY, currencyCode);
  },
};

export const formatCurrency = (amount: number, currencyCode: string = DEFAULT_CURRENCY): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const symbol = currency.symbol;
  
  // For currencies that typically put symbol after (like some European currencies)
  // You can customize this logic per currency if needed
  return `${symbol}${amount.toFixed(2)}`;
};

export const getCurrency = (currencyCode: string = DEFAULT_CURRENCY): Currency => {
  return CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
};

