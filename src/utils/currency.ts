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

export const getCurrencyFractionDigits = (currencyCode: string = DEFAULT_CURRENCY): number => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode })
      .resolvedOptions()
      .maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};

export const getMinorUnitFactor = (currencyCode: string = DEFAULT_CURRENCY): number =>
  10 ** getCurrencyFractionDigits(currencyCode);

/** Converts a human decimal string to an exact, persisted integer minor-unit value. */
export const parseMoneyInput = (value: string, currencyCode: string = DEFAULT_CURRENCY): number | null => {
  const trimmed = value.trim();
  const digits = getCurrencyFractionDigits(currencyCode);
  const match = new RegExp(`^(-?)(\\d+)(?:\\.(\\d{0,${digits}}))?$`).exec(trimmed);
  if (!match) return null;

  const [, sign, whole, fraction = ''] = match;
  const minor = Number(whole) * getMinorUnitFactor(currencyCode)
    + Number(fraction.padEnd(digits, '0') || '0');
  return Number.isSafeInteger(minor) ? (sign === '-' ? -minor : minor) : null;
};

/** Formats an existing minor-unit value for a controlled form input. */
export const formatMoneyInput = (amountMinor: number, currencyCode: string = DEFAULT_CURRENCY): string => {
  const digits = getCurrencyFractionDigits(currencyCode);
  const factor = getMinorUnitFactor(currencyCode);
  const sign = amountMinor < 0 ? '-' : '';
  const absolute = Math.abs(amountMinor);
  const whole = Math.floor(absolute / factor);
  const fraction = absolute % factor;
  return digits === 0 ? `${sign}${whole}` : `${sign}${whole}.${String(fraction).padStart(digits, '0')}`;
};

/** Only use this conversion at display/export/chart boundaries. */
export const minorToMajor = (amountMinor: number, currencyCode: string = DEFAULT_CURRENCY): number =>
  amountMinor / getMinorUnitFactor(currencyCode);

export const formatCurrency = (amountMinor: number, currencyCode: string = DEFAULT_CURRENCY): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(minorToMajor(amountMinor, currencyCode));
  } catch {
    return `${currencyCode} ${formatMoneyInput(amountMinor, currencyCode)}`;
  }
};

export const getCurrency = (currencyCode: string = DEFAULT_CURRENCY): Currency => {
  return CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0]!;
};
