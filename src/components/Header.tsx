import { CURRENCIES } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

// Professional SVG icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface HeaderProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ currency, onCurrencyChange, searchQuery, onSearchChange }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="app-header">
      <div className="header-search">
        <span className="search-icon"><SearchIcon /></span>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="header-actions">
        <div className="currency-selector-header">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="currency-select-header"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code}
              </option>
            ))}
          </select>
        </div>
        <button className="header-notification" title={t.notifications}>
          <BellIcon />
        </button>
        <div className="header-avatar" title={t.user}>
          <UserIcon />
        </div>
      </div>
    </header>
  );
}

