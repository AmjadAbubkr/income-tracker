import { useState, useRef, useEffect } from 'react';
import { CURRENCIES } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface HeaderProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewChange: (view: any) => void;
}

/**
 * App header bar – matches the Stitch "FinancePro" top header.
 * Updated with Auth and Notifications dropdowns.
 */
export default function Header({ currency, onCurrencyChange, searchQuery, onSearchChange, onViewChange }: HeaderProps) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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

  const handleNotificationClick = (id: string, actionParams?: any) => {
    markAsRead(id);
    if (actionParams?.view) {
      onViewChange(actionParams.view);
    }
    setShowNotifDropdown(false);
  };

  return (
    <header className="app-header">
      <div className="header-title-v2">
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, margin: 0 }}>Dashboard Overview</h1>
      </div>

      <div className="header-search">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="header-actions">

        {/* Notifications Dropdown */}
        <div className="header-notification" style={{ position: 'relative' }} ref={notifRef}>
          <div
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={t.notifications}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

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

        {/* User Account Dropdown */}
        <div className="header-avatar" style={{ position: 'relative' }} ref={userRef}>
          <div
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={user?.name}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
          </div>

          {showUserDropdown && (
            <div className="header-dropdown user-dropdown">
              <div className="dropdown-profile">
                <div className="avatar-large">
                  {user?.name?.[0].toUpperCase()}
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
      </div>
    </header>
  );
}

