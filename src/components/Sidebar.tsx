import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * MaterialIcon – renders a Google Material Symbols Outlined icon.
 * Using <span> with the "material-symbols-outlined" class, which is
 * loaded via Google Fonts in index.html.
 */
const MaterialIcon = ({ name }: { name: string }) => (
  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{name}</span>
);

export default function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreSheetRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);

  /* Each item maps to a Material Symbols icon name from the Stitch designs */
  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: <MaterialIcon name="dashboard" /> },
    { id: 'sales', label: t.sales, icon: <MaterialIcon name="point_of_sale" /> },
    { id: 'expenses', label: t.expenses, icon: <MaterialIcon name="receipt_long" /> },
    { id: 'products', label: t.products, icon: <MaterialIcon name="inventory_2" /> },
    { id: 'subscriptions', label: t.subscriptions, icon: <MaterialIcon name="autorenew" /> },
    { id: 'analytics', label: t.analytics, icon: <MaterialIcon name="bar_chart" /> },
    { id: 'settings', label: t.settings, icon: <MaterialIcon name="settings" /> },
  ];
  // ... existing useEffects for mobile logic ...
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');

    const update = () => setIsMobile(media.matches);
    update();

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const primaryIds = useMemo(() => ['dashboard', 'products', 'sales', 'analytics'], []);
  const moreIds = useMemo(() => ['expenses', 'subscriptions', 'settings'], []);

  const primaryItems = useMemo(
    () => menuItems.filter((item) => primaryIds.includes(item.id)),
    [menuItems, primaryIds]
  );

  const moreItems = useMemo(
    () => menuItems.filter((item) => moreIds.includes(item.id)),
    [menuItems, moreIds]
  );

  const isMoreActive = useMemo(() => moreIds.includes(currentView), [currentView, moreIds]);

  const handleNavigate = (view: string) => {
    onViewChange(view);
    setIsMoreOpen(false);
  };

  const closeMore = () => {
    moreButtonRef.current?.focus();
    setIsMoreOpen(false);
  };

  useEffect(() => {
    if (!isMobile) return;

    const sheet = moreSheetRef.current;
    if (!sheet) return;

    if (isMoreOpen) {
      sheet.removeAttribute('inert');
    } else {
      sheet.setAttribute('inert', '');
      const active = document.activeElement as Element | null;
      if (active && sheet.contains(active)) {
        moreButtonRef.current?.focus();
      }
    }
  }, [isMobile, isMoreOpen]);

  useEffect(() => {
    if (!isMobile) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMore();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !isMoreOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (moreButtonRef.current && moreButtonRef.current.contains(target)) {
        return;
      }
      if (moreSheetRef.current && !moreSheetRef.current.contains(target)) {
        closeMore();
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [isMobile, isMoreOpen]);

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar header — branded logo area matching Stitch design */}
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
            <>
              {primaryItems.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.id)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              ))}

              <button
                className={`sidebar-item ${isMoreActive ? 'active' : ''}`}
                onClick={() => setIsMoreOpen((v) => !v)}
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
                ref={moreButtonRef}
              >
                <span className="sidebar-icon"><MaterialIcon name="more_horiz" /></span>
                <span className="sidebar-label">{t.more}</span>
              </button>
            </>
          ) : (
            <>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => onViewChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
                </button>
              ))}
            </>
          )}
        </nav>
        <div className="sidebar-profile">
          <div className="profile-avatar-mini" style={{
            width: '32px',
            height: '32px',
            background: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            flexShrink: 0
          }}>
            {user?.name?.[0].toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="profile-info">
              <span className="profile-name">{user?.name || 'User'}</span>
              <span className="profile-email">{user?.email || ''}</span>
            </div>
          )}
          {!isCollapsed && <MaterialIcon name="unfold_more" />}
        </div>
      </aside>

      {isMobile && (
        <div
          ref={moreSheetRef}
          className={`more-sheet ${isMoreOpen ? 'open' : ''}`}
          aria-hidden={!isMoreOpen}
        >
          <div className="more-sheet-handle" />
          <div className="more-sheet-header">
            <div className="more-sheet-title">{t.more}</div>
            <button className="more-sheet-close" onClick={closeMore} title={t.close}>×</button>
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

