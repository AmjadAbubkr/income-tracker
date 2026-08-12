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

  // Close dropdowns when clicking outside their containers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
  const handleNotificationClick = (id: string, actionParams?: Record<string, unknown>) => {
    markAsRead(id);
    const view = actionParams?.['view'];
    // Narrow: only navigate if view is a non-empty string
    if (typeof view === 'string' && view.length > 0) {
      onViewChange(view as View);
    }
    setShowNotifDropdown(false);
  };

  return (
    <header className="app-header">
      <div className="header-left-mobile mobile-only">
        <div className="mobile-user-avatar" onClick={() => setShowUserDropdown(!showUserDropdown)}>
          <div className="avatar-mini-circle">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
        <div className="header-greeting">
          <span className="greeting-text">Good Morning,</span>
          <span className="user-name">{user?.name || 'Alex Morgan'}</span>
        </div>
      </div>

      <div className="header-title-v2 desktop-only">
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, margin: 0 }}>Dashboard Overview</h1>
      </div>

      <div className="header-search desktop-only">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">search</span>
        <input
          type="text"
          name="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          aria-label="Search transactions"
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
                <button onClick={clearAll} className="clear-btn">{t.clearAll || 'Clear'}</button>
              </div>
              <div className="dropdown-list">
                {notifications.length === 0 ? (
                  <div className="empty-state">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
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
                    </div>
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
            aria-label={user?.name || 'User menu'}
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
              <div className="dropdown-item" onClick={() => { onViewChange('settings'); setShowUserDropdown(false); }}>
                <span className="material-symbols-outlined">settings</span>
                <span>{t.settings}</span>
              </div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span>
                <span>{t.logout}</span>
              </div>
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
            <div className="dropdown-item" onClick={() => { onViewChange('settings'); setShowUserDropdown(false); }}>
              <span className="material-symbols-outlined">settings</span>
              <span>{t.settings}</span>
            </div>
            <div className="dropdown-item logout" onClick={handleLogout}>
              <span className="material-symbols-outlined">logout</span>
              <span>{t.logout}</span>
            </div>
          </div>
        )}

        <div className="currency-selector-header desktop-only">
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
      </div>
    </header>
  );
}
