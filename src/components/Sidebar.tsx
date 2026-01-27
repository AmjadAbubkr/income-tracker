import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Professional SVG icons
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const SalesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ProductsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ExpensesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const SubscriptionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 1-9 9" />
    <path d="M3 12a9 9 0 0 1 9-9" />
    <polyline points="16 16 12 20 8 16" />
    <polyline points="8 8 12 4 16 8" />
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);

export default function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreSheetRef = useRef<HTMLDivElement | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: <DashboardIcon /> },
    { id: 'sales', label: t.sales, icon: <SalesIcon /> },
    { id: 'expenses', label: t.expenses, icon: <ExpensesIcon /> },
    { id: 'products', label: t.products, icon: <ProductsIcon /> },
    { id: 'subscriptions', label: t.subscriptions, icon: <SubscriptionsIcon /> },
    { id: 'analytics', label: t.analytics, icon: <AnalyticsIcon /> },
    { id: 'settings', label: t.settings, icon: <SettingsIcon /> },
  ];

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
        <div className="sidebar-header" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {!isCollapsed && <h2 className="sidebar-logo">Income Tracker</h2>}
          <button className="sidebar-toggle" onClick={onToggleCollapse} title={isCollapsed ? 'Expand' : 'Collapse'}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
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
                <span className="sidebar-icon"><MoreIcon /></span>
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

