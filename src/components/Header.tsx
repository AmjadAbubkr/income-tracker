import { useState, useRef, useEffect } from 'react';
import { CURRENCIES } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import type { View } from '../types';

interface HeaderProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** Strictly typed — only accepts valid view names, not arbitrary strings. */
  onViewChange: (view: View) => void;
}

/**
 * App header bar — search, notifications, user account, and currency selector.
 */
export default function Header({ currency, onCurrencyChange, searchQuery, onSearchChange, onViewChange }: HeaderProps) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  /**
   * Handles notification click — marks it read, then navigates if the
   * notification carries an `actionParams.view` payload.
   * actionParams is typed as Record<string, unknown> instead of `any`
   * so we can safely narrow the `view` value before using it.
   */
  const handleNotificationClick = (id: string, actionParams?: { view: View; itemId?: string }) => {
    markAsRead(id);
    const validViews: View[] = ['dashboard', 'sales', 'products', 'analytics', 'settings', 'expenses', 'subscriptions'];
    if (actionParams && validViews.includes(actionParams.view)) {
      onViewChange(actionParams.view);
    }
    setShowNotifDropdown(false);
  };

  return (
    <header className="app-header">
      <div className="header-left-mobile mobile-only">
        <button type="button" className="mobile-user-avatar" onClick={() => setShowUserDropdown(!showUserDropdown)} aria-label={t.userMenu}>
          <div className="avatar-mini-circle">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </button>
        <div className="header-greeting">
            <span className="greeting-text">{t.goodMorning},</span>
            <span className="user-name">{user?.name || t.user}</span>
        </div>
      </div>

      <div className="header-title-v2 desktop-only">
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, margin: 0 }}>{t.dashboardOverview}</h1>
      </div>

      <div className="header-search desktop-only">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">search</span>
        <input
          type="text"
          name="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={t.searchTransactions}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          aria-label={t.searchTransactions}
        />
      </div>

      <div className="header-actions">

        {/* Notifications Dropdown */}
        <div className="header-notification" style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0 }}
            title={t.notifications}
            aria-label={t.notifications}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--text)' }} aria-hidden="true">notifications</span>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifDropdown && (
            <div className="header-dropdown notification-dropdown">
              <div className="dropdown-header">
                <h3>{t.notifications}</h3>
                <button type="button" onClick={clearAll} className="clear-btn" aria-label={t.clearAll || 'Clear'}>{t.clearAll || 'Clear'}</button>
              </div>
              <div className="dropdown-list">
                {notifications.length === 0 ? (
                  <div className="empty-state">{t.noNewNotifications}</div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      type="button"
                      className={`notif-item ${n.read ? 'read' : 'unread'}`}
                      onClick={() => handleNotificationClick(n.id, n.actionParams)}
                    >
                      <div className="notif-icon-circle" style={{ background: n.type === 'stock' ? 'var(--warning-bg)' : 'var(--accent-bg)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: n.type === 'stock' ? 'var(--warning)' : 'var(--accent)' }}>
                          {n.type === 'stock' ? 'inventory_2' : 'payments'}
                        </span>
                      </div>
                      <div className="notif-content">
                        <h4>{n.title}</h4>
                        <p>{n.message}</p>
                        <span className="notif-time">{n.date}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Dropdown — desktop only, mobile has avatar on the left */}
        <div className="header-avatar desktop-only" style={{ position: 'relative' }} ref={userRef}>
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0 }}
            title={user?.name}
            aria-label={user?.name || t.userMenu}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden="true">person</span>
          </button>

          {showUserDropdown && (
            <div className="header-dropdown user-dropdown">
              <div className="dropdown-profile">
                <div className="avatar-large">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="profile-info">
                  <h4>{user?.name}</h4>
                  <p>{user?.email}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button type="button" className="dropdown-item" onClick={() => { onViewChange('settings'); setShowUserDropdown(false); }}>
                <span className="material-symbols-outlined" aria-hidden="true">settings</span>
                <span>{t.settings}</span>
              </button>
              <button type="button" className="dropdown-item logout" onClick={handleLogout}>
                <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                <span>{t.logout}</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile user dropdown (triggered from the left avatar) */}
        {showUserDropdown && (
          <div className="header-dropdown user-dropdown mobile-only-dropdown mobile-only">
            <div className="dropdown-profile">
              <div className="avatar-large">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <h4>{user?.name}</h4>
                <p>{user?.email}</p>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <button type="button" className="dropdown-item" onClick={() => { onViewChange('settings'); setShowUserDropdown(false); }}>
              <span className="material-symbols-outlined" aria-hidden="true">settings</span>
              <span>{t.settings}</span>
            </button>
            <button type="button" className="dropdown-item logout" onClick={handleLogout}>
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              <span>{t.logout}</span>
            </button>
          </div>
        )}

        <div className="currency-selector-header desktop-only">
          <label htmlFor="header-currency" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{t.currency || 'Currency'}</label>
          <select
            id="header-currency"
            aria-label={t.currency || 'Currency'}
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="currency-select-header"
            style={{ backgroundColor: 'var(--bg-card-solid)', color: 'var(--text)' }}
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
