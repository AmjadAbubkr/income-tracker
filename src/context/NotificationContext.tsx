import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import type { View } from '../types';

export interface Notification {
  id: string;
  type: 'stock' | 'subscription' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionParams?: { view: View; itemId?: string };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function replaceTokens(value: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce((result, [key, token]) => result.replace(`{${key}}`, token), value);
}

export function isLowStock(inventory: number | undefined): boolean {
  return inventory !== undefined && inventory <= 5;
}

export function isWithinNextDays(date: string, today: string, days: number): boolean {
  const latest = new Date(`${today}T00:00:00.000Z`);
  latest.setUTCDate(latest.getUTCDate() + days);
  return date >= today && date <= latest.toISOString().split('T')[0]!;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const today = new Date().toISOString().split('T')[0]!;
    const nextNotifications: Notification[] = [];

    const products = await storage.getProducts();
    products.forEach((product) => {
      if (isLowStock(product.inventory)) {
        nextNotifications.push({
          id: `stock-${product.id}-${today}`,
          type: 'stock',
          title: t.lowStockAlert,
          message: replaceTokens(t.stockRunningLow, { name: product.name, stock: String(product.inventory) }),
          date: today,
          read: false,
          actionParams: { view: 'products', itemId: product.id },
        });
      }
    });

    const businessSubscriptions = await storage.getBusinessSubscriptions();
    businessSubscriptions.forEach((subscription) => {
      if (subscription.status === 'active' && isWithinNextDays(subscription.nextBillingDate, today, 3)) {
        nextNotifications.push({
          id: `biz-sub-${subscription.id}-${subscription.nextBillingDate}`,
          type: 'subscription',
          title: t.upcomingPayment,
          message: replaceTokens(t.businessSubscriptionRenews, { name: subscription.name, date: subscription.nextBillingDate }),
          date: today,
          read: false,
          actionParams: { view: 'subscriptions', itemId: subscription.id },
        });
      }
    });

    const customerSubscriptions = await storage.getCustomerSubscriptions();
    customerSubscriptions.forEach((subscription) => {
      if (subscription.status === 'active' && isWithinNextDays(subscription.nextBillingDate, today, 3)) {
        nextNotifications.push({
          id: `cust-sub-${subscription.id}-${subscription.nextBillingDate}`,
          type: 'subscription',
          title: t.upcomingRevenue,
          message: replaceTokens(t.customerSubscriptionRenews, { name: subscription.customerName, date: subscription.nextBillingDate }),
          date: today,
          read: false,
          actionParams: { view: 'subscriptions', itemId: subscription.id },
        });
      }
    });

    setNotifications((previous) => {
      const readById = new Map(previous.map((notification) => [notification.id, notification.read]));
      return nextNotifications
        .map((notification) => ({ ...notification, read: readById.get(notification.id) ?? false }))
        .sort((a, b) => b.date.localeCompare(a.date));
    });
  }, [language, t, user]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  const markAsRead = (id: string) => {
    setNotifications((previous) => previous.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
  };

  const clearAll = () => setNotifications([]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}
