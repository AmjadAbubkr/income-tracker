import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { currencyStorage } from './utils/currency';
import { useCurrentDate } from './hooks/useCurrentDate';
import { useSubscriptionStore } from './stores/subscriptionStore';
import { useIncomeStore } from './stores/incomeStore';
import { useExpenseStore } from './stores/expenseStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SalesPage from './components/SalesPage';
import ProductsPage from './components/ProductsPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import ExpensesPage from './components/ExpensesPage';
import SubscriptionsPage from './components/SubscriptionsPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';
import './mobile.css';
import './liquid-glass.css';

const queryClient = new QueryClient();

type View = 'dashboard' | 'sales' | 'products' | 'analytics' | 'settings' | 'expenses' | 'subscriptions';

function AppLayout({
  currentView,
  setCurrentView,
  userId,
}: {
  currentView: View;
  setCurrentView: (v: View) => void;
  userId: string;
}) {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState(() => currencyStorage.getCurrency());
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { todayDate } = useCurrentDate();

  const subscriptionStore = useSubscriptionStore();
  const incomeStore = useIncomeStore();
  const expenseStore = useExpenseStore();

  /* ── Load data on mount ── */
  useEffect(() => {
    subscriptionStore.fetch();
    incomeStore.fetch();
    expenseStore.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /* ── Subscription auto-recording ── */
  useEffect(() => {
    subscriptionStore.processAutoRecording().then(({ newExpenses, newIncome }) => {
      if (newExpenses.length > 0) {
        expenseStore.fetch();
      }
      if (newIncome.length > 0) {
        incomeStore.fetch();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayDate, userId]);

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    currencyStorage.saveCurrency(currencyCode);
  };

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view as View)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="app-main">
        <Header
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onViewChange={(view) => setCurrentView(view as View)}
        />
        <main className="main-content" id="main-content">
          {currentView === 'dashboard' && <Dashboard currency={currency} />}
          {currentView === 'sales' && <SalesPage currency={currency} />}
          {currentView === 'products' && <ProductsPage currency={currency} searchQuery={searchQuery} />}
          {currentView === 'analytics' && <AnalyticsPage currency={currency} currentMonth={todayDate.slice(0,7)} />}
          {currentView === 'expenses' && <ExpensesPage currency={currency} />}
          {currentView === 'subscriptions' && <SubscriptionsPage currency={currency} />}
          {currentView === 'settings' && (
            <SettingsPage currency={currency} onCurrencyChange={handleCurrencyChange} />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg)',
        }}
        aria-live="polite"
      >
        <div className="loading-spinner"></div>
        <span
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
          }}
        >
          Loading…
        </span>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <LoginPage onSwitchMode={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchMode={() => setAuthView('login')} />
    );
  }

  return <AppLayout currentView={currentView} setCurrentView={setCurrentView} userId={user.id} />;
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
