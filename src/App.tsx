import { useState, useEffect } from 'react';
import { Product, IncomeEntry, Expense, BusinessSubscription, CustomerSubscription } from './types';
import { storage } from './utils/storage';
import { currencyStorage } from './utils/currency';
import { dailyStatsStorage } from './utils/dailyStats';
import { useCurrentDate } from './hooks/useCurrentDate';
import { calculateNextBillingDate } from './utils/dateUtils';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SalesPage from './components/SalesPage';
import ProductsPage from './components/ProductsPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import ExpensesPage from './components/ExpensesPage';
import SubscriptionsPage from './components/SubscriptionsPage';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import './App.css';
import './mobile.css';

type View = 'dashboard' | 'sales' | 'products' | 'analytics' | 'settings' | 'expenses' | 'subscriptions';

function App() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [businessSubscriptions, setBusinessSubscriptions] = useState<BusinessSubscription[]>([]);
  const [customerSubscriptions, setCustomerSubscriptions] = useState<CustomerSubscription[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currency, setCurrency] = useState<string>(currencyStorage.getCurrency());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const { todayDate, currentMonth } = useCurrentDate();

  useEffect(() => {
    const loadData = async () => {
      const [loadedProducts, loadedEntries, loadedExpenses, loadedBizSubs, loadedCustSubs] = await Promise.all([
        storage.getProducts(),
        storage.getIncomeEntries(),
        storage.getExpenses(),
        storage.getBusinessSubscriptions(),
        storage.getCustomerSubscriptions(),
      ]);
      setProducts(loadedProducts);
      setIncomeEntries(loadedEntries);
      setExpenses(loadedExpenses);
      setBusinessSubscriptions(loadedBizSubs);
      setCustomerSubscriptions(loadedCustSubs);
    };
    loadData();

    // Reset daily stats if new day
    dailyStatsStorage.resetIfNewDay();
  }, []);

  // Reset daily stats when day changes
  useEffect(() => {
    dailyStatsStorage.resetIfNewDay();
  }, [todayDate]);

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    currencyStorage.saveCurrency(currencyCode);
  };

  // Automatic Subscription Recording
  useEffect(() => {
    const processAutoRecording = async () => {
      if (businessSubscriptions.length === 0 && customerSubscriptions.length === 0) return;

      const today = new Date().toISOString().split('T')[0];
      let hasChanges = false;

      const newExpenses: Expense[] = [];
      const newIncomeEntries: IncomeEntry[] = [];
      const updatedBusSubs = [...businessSubscriptions];
      const updatedCustSubs = [...customerSubscriptions];

      // Process Business Subscriptions
      updatedBusSubs.forEach((sub, index) => {
        let currentSub = { ...sub };
        let subChanged = false;
        while (currentSub.status === 'active' && currentSub.nextBillingDate <= today && currentSub.nextBillingDate !== '') {
          newExpenses.push({
            id: crypto.randomUUID(),
            amount: currentSub.amount,
            category: currentSub.category || 'Service',
            description: `Recurring: ${currentSub.name}`,
            date: currentSub.nextBillingDate,
          });

          currentSub.nextBillingDate = calculateNextBillingDate(currentSub.nextBillingDate, currentSub.billingCycle);
          subChanged = true;
          hasChanges = true;
        }
        if (subChanged) {
          updatedBusSubs[index] = currentSub;
        }
      });

      // Process Customer Subscriptions
      updatedCustSubs.forEach((sub, index) => {
        let currentSub = { ...sub };
        let subChanged = false;
        while (currentSub.status === 'active' && currentSub.nextBillingDate <= today && currentSub.nextBillingDate !== '') {
          newIncomeEntries.push({
            id: crypto.randomUUID(),
            productId: 'subscription', // Placeholder for subscription-based income
            quantity: 1,
            amount: currentSub.amount,
            date: currentSub.nextBillingDate,
            notes: `Recurring: ${currentSub.serviceName} - ${currentSub.customerName}`,
          });

          currentSub.nextBillingDate = calculateNextBillingDate(currentSub.nextBillingDate, currentSub.billingCycle);
          subChanged = true;
          hasChanges = true;
        }
        if (subChanged) {
          updatedCustSubs[index] = currentSub;
        }
      });

      if (hasChanges) {
        if (newExpenses.length > 0) {
          const allExpenses = [...expenses, ...newExpenses];
          setExpenses(allExpenses);
          await storage.saveExpenses(allExpenses);
        }

        if (newIncomeEntries.length > 0) {
          const allEntries = [...incomeEntries, ...newIncomeEntries];
          setIncomeEntries(allEntries);
          await storage.saveIncomeEntries(allEntries);

          // Update daily stats for entries that occurred today
          const todayEntries = newIncomeEntries.filter(e => e.date === today);
          if (todayEntries.length > 0) {
            todayEntries.forEach(entry => {
              dailyStatsStorage.addSale(entry.amount, entry.quantity);
            });
          }
        }

        setBusinessSubscriptions(updatedBusSubs);
        setCustomerSubscriptions(updatedCustSubs);
        await storage.saveBusinessSubscriptions(updatedBusSubs);
        await storage.saveCustomerSubscriptions(updatedCustSubs);
      }
    };

    // Run only after initial data load
    if (businessSubscriptions.length > 0 || customerSubscriptions.length > 0) {
      processAutoRecording();
    }
  }, [todayDate, businessSubscriptions.length > 0, customerSubscriptions.length > 0]);

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    await storage.saveProducts(updatedProducts);
  };

  const handleEditProduct = async (productData: Omit<Product, 'id' | 'createdAt'>, id: string) => {
    const updatedProducts = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...productData,
        };
      }
      return p;
    });
    setProducts(updatedProducts);
    await storage.saveProducts(updatedProducts);
  };

  const handleAddIncome = async (entryData: Omit<IncomeEntry, 'id'>) => {
    const newEntry: IncomeEntry = {
      ...entryData,
      id: crypto.randomUUID(),
    };
    const updatedEntries = [...incomeEntries, newEntry];
    setIncomeEntries(updatedEntries);
    await storage.saveIncomeEntries(updatedEntries);

    // Update daily stats
    dailyStatsStorage.addSale(newEntry.amount, newEntry.quantity);

    // Update inventory if product tracks it
    const product = products.find((p) => p.id === entryData.productId);
    if (product && product.inventory !== undefined) {
      const updatedProducts = products.map((p) => {
        if (p.id === entryData.productId) {
          return {
            ...p,
            inventory: Math.max(0, (p.inventory || 0) - entryData.quantity),
          };
        }
        return p;
      });
      setProducts(updatedProducts);
      await storage.saveProducts(updatedProducts);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm(t.confirmDeleteProductWithEntries)) {
      const updatedProducts = products.filter((p) => p.id !== id);
      const updatedEntries = incomeEntries.filter((e) => e.productId !== id);
      setProducts(updatedProducts);
      setIncomeEntries(updatedEntries);
      await storage.saveProducts(updatedProducts);
      await storage.saveIncomeEntries(updatedEntries);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (confirm(t.confirmDeleteEntry)) {
      const entryToDelete = incomeEntries.find((e) => e.id === id);
      const updatedEntries = incomeEntries.filter((e) => e.id !== id);
      setIncomeEntries(updatedEntries);
      await storage.saveIncomeEntries(updatedEntries);

      // Restore inventory if product tracks it
      if (entryToDelete) {
        const product = products.find((p) => p.id === entryToDelete.productId);
        if (product && product.inventory !== undefined) {
          const updatedProducts = products.map((p) => {
            if (p.id === entryToDelete.productId) {
              return {
                ...p,
                inventory: (p.inventory || 0) + entryToDelete.quantity,
              };
            }
            return p;
          });
          setProducts(updatedProducts);
          await storage.saveProducts(updatedProducts);
        }

        // Recalculate daily stats from remaining entries
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = updatedEntries.filter((e) => e.date === today);
        const todayStats = {
          totalSales: todayEntries.length,
          totalRevenue: todayEntries.reduce((sum, e) => sum + e.amount, 0),
          totalItems: todayEntries.reduce((sum, e) => sum + e.quantity, 0),
        };
        dailyStatsStorage.updateTodayStats(todayStats);
      }
    }
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await storage.saveExpenses(updatedExpenses);
  };

  const handleDeleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);
    await storage.saveExpenses(updatedExpenses);
  };

  // Business Subscriptions Handlers
  const handleAddBusinessSub = async (subData: Omit<BusinessSubscription, 'id'>) => {
    const newSub: BusinessSubscription = { ...subData, id: crypto.randomUUID() };
    const updated = [...businessSubscriptions, newSub];
    setBusinessSubscriptions(updated);
    await storage.saveBusinessSubscriptions(updated);
  };

  const handleEditBusinessSub = async (subData: Omit<BusinessSubscription, 'id'>, id: string) => {
    const updated = businessSubscriptions.map(s => s.id === id ? { ...subData, id } : s);
    setBusinessSubscriptions(updated);
    await storage.saveBusinessSubscriptions(updated);
  };

  const handleDeleteBusinessSub = async (id: string) => {
    if (confirm(t.confirmDeleteSubscription)) {
      const updated = businessSubscriptions.filter(s => s.id !== id);
      setBusinessSubscriptions(updated);
      await storage.saveBusinessSubscriptions(updated);
    }
  };

  // Customer Subscriptions Handlers
  const handleAddCustomerSub = async (subData: Omit<CustomerSubscription, 'id'>) => {
    const newSub: CustomerSubscription = { ...subData, id: crypto.randomUUID() };
    const updated = [...customerSubscriptions, newSub];
    setCustomerSubscriptions(updated);
    await storage.saveCustomerSubscriptions(updated);
  };

  const handleEditCustomerSub = async (subData: Omit<CustomerSubscription, 'id'>, id: string) => {
    const updated = customerSubscriptions.map(s => s.id === id ? { ...subData, id } : s);
    setCustomerSubscriptions(updated);
    await storage.saveCustomerSubscriptions(updated);
  };

  const handleDeleteCustomerSub = async (id: string) => {
    if (confirm(t.confirmDeleteSubscription)) {
      const updated = customerSubscriptions.filter(s => s.id !== id);
      setCustomerSubscriptions(updated);
      await storage.saveCustomerSubscriptions(updated);
    }
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
        />
        <main className="main-content">
          {currentView === 'dashboard' && (
            <Dashboard
              products={products}
              incomeEntries={incomeEntries}
              onDeleteProduct={handleDeleteProduct}
              onDeleteIncome={handleDeleteIncome}
              currency={currency}
              todayDate={todayDate}
              currentMonth={currentMonth}
            />
          )}
          {currentView === 'sales' && (
            <SalesPage
              products={products}
              incomeEntries={incomeEntries}
              onAddProduct={handleAddProduct}
              onAddIncome={handleAddIncome}
              onDeleteProduct={handleDeleteProduct}
              currency={currency}
            />
          )}
          {currentView === 'products' && (
            <ProductsPage
              products={products}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleEditProduct}
              onAddProduct={handleAddProduct}
              currency={currency}
              searchQuery={searchQuery}
            />
          )}
          {currentView === 'analytics' && (
            <AnalyticsPage
              products={products}
              incomeEntries={incomeEntries}
              expenses={expenses}
              businessSubscriptions={businessSubscriptions}
              customerSubscriptions={customerSubscriptions}
              currency={currency}
              currentMonth={currentMonth}
            />
          )}
          {currentView === 'expenses' && (
            <ExpensesPage
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              currency={currency}
            />
          )}
          {currentView === 'subscriptions' && (
            <SubscriptionsPage
              businessSubscriptions={businessSubscriptions}
              customerSubscriptions={customerSubscriptions}
              onAddBusinessSub={handleAddBusinessSub}
              onEditBusinessSub={handleEditBusinessSub}
              onDeleteBusinessSub={handleDeleteBusinessSub}
              onAddCustomerSub={handleAddCustomerSub}
              onEditCustomerSub={handleEditCustomerSub}
              onDeleteCustomerSub={handleDeleteCustomerSub}
              currency={currency}
            />
          )}
          {currentView === 'settings' && (
            <SettingsPage
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function Root() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  );
}
