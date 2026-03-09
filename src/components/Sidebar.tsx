import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MaterialIcon = ({ name }: { name: string }) => (
  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{name}</span>
);

export default function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreSheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: t.dashboard, icon: <MaterialIcon name="dashboard" /> },
    { id: 'sales', label: t.sales, icon: <MaterialIcon name="point_of_sale" /> },
    { id: 'expenses', label: t.expenses, icon: <MaterialIcon name="receipt_long" /> },
    { id: 'products', label: t.products, icon: <MaterialIcon name="inventory_2" /> },
    { id: 'subscriptions', label: t.subscriptions, icon: <MaterialIcon name="autorenew" /> },
    { id: 'analytics', label: t.analytics, icon: <MaterialIcon name="bar_chart" /> },
    { id: 'settings', label: t.settings, icon: <MaterialIcon name="settings" /> },
  ], [t]);

  const mobileMenuItems = useMemo(() => [
    { id: 'dashboard', label: t.dashboard || 'Home', icon: <MaterialIcon name="home" /> },
    { id: 'analytics', label: t.analytics, icon: <MaterialIcon name="analytics" /> },
    { id: 'sales', label: '', icon: <div className="mobile-plus-btn"><MaterialIcon name="add" /></div> },
    { id: 'products', label: t.products, icon: <MaterialIcon name="inventory_2" /> },
    { id: 'settings', label: t.settings, icon: <MaterialIcon name="settings" /> },
  ], [t]);

  const moreIds = ['expenses', 'subscriptions'];
  const moreItems = menuItems.filter((item) => moreIds.includes(item.id));

  const handleNavigate = (view: string) => {
    onViewChange(view);
    setIsMoreOpen(false);
  };

  const closeMore = () => {
    setIsMoreOpen(false);
  };

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(17, 82, 212, 0.15)', padding: '6px', borderRadius: '8px', color: '#1152d4', display: 'flex' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>account_balance_wallet</span>
              </div>
              <h2 className="sidebar-logo">Income Tracker</h2>
            </div>
          )}
          <button className="sidebar-toggle" onClick={onToggleCollapse} title={isCollapsed ? 'Expand' : 'Collapse'}>
            <MaterialIcon name={isCollapsed ? 'chevron_right' : 'chevron_left'} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {isMobile ? (
            mobileMenuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${currentView === item.id ? 'active' : ''} ${item.id === 'sales' ? 'plus-item' : ''}`}
                onClick={() => handleNavigate(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label && <span className="sidebar-label">{item.label}</span>}
              </button>
            ))
          ) : (
            menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => onViewChange(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </button>
            ))
          )}
        </nav>
        {!isMobile && (
          <div className="sidebar-profile desktop-only">
            <div className="profile-avatar-mini" style={{
              width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              fontWeight: '600', fontSize: '14px', flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="profile-info">
                <span className="profile-name">{user?.name || 'User'}</span>
                <span className="profile-email">{user?.email || ''}</span>
              </div>
            )}
            {!isCollapsed && <MaterialIcon name="unfold_more" />}
          </div>
        )}
      </aside>

      {isMobile && isMoreOpen && (
        <div ref={moreSheetRef} className="more-sheet open">
          <div className="more-sheet-handle" />
          <div className="more-sheet-header">
            <div className="more-sheet-title">{t.more}</div>
            <button className="more-sheet-close" onClick={closeMore}>×</button>
          </div>
          <div className="more-sheet-body">
            {moreItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
