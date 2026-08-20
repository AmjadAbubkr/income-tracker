import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import type { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MaterialIcon = ({ name }: { name: string }) => (
  <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden="true">{name}</span>
);

export default function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreSheetRef = useRef<HTMLDivElement | null>(null);

  // Detect mobile screen size and update when viewport changes
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Close More sheet on Escape
  useEffect(() => {
    if (!isMoreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMoreOpen]);

  // Full desktop sidebar navigation
  const menuItems = useMemo(() => [
    { id: 'dashboard' as View, label: t.dashboard, icon: <MaterialIcon name="dashboard" /> },
    { id: 'sales' as View, label: t.sales, icon: <MaterialIcon name="point_of_sale" /> },
    { id: 'expenses' as View, label: t.expenses, icon: <MaterialIcon name="receipt_long" /> },
    { id: 'products' as View, label: t.products, icon: <MaterialIcon name="inventory_2" /> },
    { id: 'subscriptions' as View, label: t.subscriptions, icon: <MaterialIcon name="autorenew" /> },
    { id: 'analytics' as View, label: t.analytics, icon: <MaterialIcon name="bar_chart" /> },
    { id: 'settings' as View, label: t.settings, icon: <MaterialIcon name="settings" /> },
  ], [t]);

  /**
   * Mobile bottom-bar shows 5 items.
   * The last slot is a "More" trigger (not a view) — clicking it opens the
   * bottom sheet that contains Expenses, Subscriptions, and Settings.
   * This fixes the bug where mobile users could not access those views at all.
   */
  const mobileMenuItems = useMemo(() => [
    { id: 'dashboard' as View, label: t.dashboard, icon: <MaterialIcon name="home" />, isMore: false },
    { id: 'analytics' as View, label: t.analytics, icon: <MaterialIcon name="analytics" />, isMore: false },
    { id: 'sales' as View, label: t.sales, icon: <div className="mobile-plus-btn"><MaterialIcon name="add" /></div>, isMore: false },
    { id: 'products' as View, label: t.products, icon: <MaterialIcon name="inventory_2" />, isMore: false },
    // "More" opens the bottom sheet — not a view navigation itself
    { id: 'more' as View | 'more', label: t.more, icon: <MaterialIcon name="more_horiz" />, isMore: true },
  ], [t]);

  // Items hidden in the bottom bar but accessible via the More sheet
  const moreIds: View[] = ['expenses', 'subscriptions', 'settings'];
  const moreItems = menuItems.filter((item) => moreIds.includes(item.id));

  // Navigate to a view and close the More sheet
  const handleNavigate = (view: View) => {
    onViewChange(view);
    setIsMoreOpen(false);
  };

  const closeMore = () => setIsMoreOpen(false);

  return (
    <>
      <a href="#main-content" className="skip-link" style={{ position: 'absolute', left: '-9999px', top: '8px', zIndex: 9999, padding: '8px 16px', background: 'var(--accent)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-sm)' }} onFocus={(e) => { (e.target as HTMLElement).style.left = '8px'; }} onBlur={(e) => { (e.target as HTMLElement).style.left = '-9999px'; }}>{t.skipToMainContent}</a>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <div className="sidebar-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{ background: 'var(--accent-glow)', padding: '6px', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', display: 'flex', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }} aria-hidden="true">account_balance_wallet</span>
            </div>
            <h2 className="sidebar-logo" translate="no">{t.incomeTracker}</h2>
          </div>
          <button type="button" className="sidebar-toggle" onClick={onToggleCollapse} title={isCollapsed ? t.expand : t.collapse} aria-label={isCollapsed ? t.expand : t.collapse}>
            <MaterialIcon name={isCollapsed ? 'chevron_right' : 'chevron_left'} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {isMobile ? (
            mobileMenuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.label || t.sales}
                className={`sidebar-item ${currentView === item.id ? 'active' : ''} ${item.id === 'sales' ? 'plus-item' : ''}`}
                onClick={() => {
                  if (item.isMore) {
                    // Toggle the More bottom sheet instead of navigating
                    setIsMoreOpen((prev) => !prev);
                  } else {
                    handleNavigate(item.id as View);
                  }
                }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label && <span className="sidebar-label">{item.label}</span>}
              </button>
            ))
          ) : (
            menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => onViewChange(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))
          )}
        </nav>

      </aside>

      {/* Mobile bottom sheet — slides up when "More" is tapped */}
      {isMobile && isMoreOpen && (
        <div ref={moreSheetRef} className="more-sheet open" role="dialog" aria-modal="true" aria-label={t.more} style={{ overscrollBehavior: 'contain' }}>
          <div className="more-sheet-handle" aria-hidden="true" />
          <div className="more-sheet-header">
            <div className="more-sheet-title">{t.more}</div>
            <button type="button" className="more-sheet-close" onClick={closeMore} aria-label={t.close}>×</button>
          </div>
          <div className="more-sheet-body">
            {moreItems.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
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
