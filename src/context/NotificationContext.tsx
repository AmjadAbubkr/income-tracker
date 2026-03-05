import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';

export interface Notification {
    id: string;
    type: 'stock' | 'subscription' | 'info';
    title: string;
    message: string;
    date: string;
    read: boolean;
    actionParams?: {
        view: string; // e.g., 'products', 'subscriptions'
        itemId?: string;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    clearAll: () => void;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();

    const refreshNotifications = async () => {
        if (!user) return;

        const newNotifications: Notification[] = [];
        const today = new Date().toISOString().split('T')[0];

        // 1. Check Low Stock
        const products = await storage.getProducts();
        products.forEach(p => {
            if (p.inventory !== undefined && p.inventory <= 5) {
                newNotifications.push({
                    id: `stock-${p.id}-${today}`,
                    type: 'stock',
                    title: 'Low Stock Alert',
                    message: `${p.name} is running low (${p.inventory} left).`,
                    date: today,
                    read: false,
                    actionParams: { view: 'products', itemId: p.id }
                });
            }
        });

        // 2. Check Subscriptions Renewing Soon (next 3 days)
        const next3Days = new Date();
        next3Days.setDate(next3Days.getDate() + 3);
        const next3DaysStr = next3Days.toISOString().split('T')[0];

        const bizSubs = await storage.getBusinessSubscriptions();
        bizSubs.forEach(s => {
            if (s.status === 'active' && s.nextBillingDate <= next3DaysStr && s.nextBillingDate >= today) {
                newNotifications.push({
                    id: `biz-sub-${s.id}-${s.nextBillingDate}`,
                    type: 'subscription',
                    title: 'Upcoming Payment',
                    message: `Business subscription ${s.name} renews on ${s.nextBillingDate}.`,
                    date: today,
                    read: false,
                    actionParams: { view: 'subscriptions', itemId: s.id }
                });
            }
        });

        const custSubs = await storage.getCustomerSubscriptions();
        custSubs.forEach(s => {
            if (s.status === 'active' && s.nextBillingDate <= next3DaysStr && s.nextBillingDate >= today) {
                newNotifications.push({
                    id: `cust-sub-${s.id}-${s.nextBillingDate}`,
                    type: 'subscription',
                    title: 'Upcoming Revenue',
                    message: `Customer ${s.customerName} subscription renews on ${s.nextBillingDate}.`,
                    date: today,
                    read: false,
                    actionParams: { view: 'subscriptions', itemId: s.id }
                });
            }
        });

        // Merge with existing notifications to preserve 'read' status if ID matches
        // In a real app, notifications would be stored in DB. Here we re-generate daily alerts, 
        // but we can persist read status in localStorage or just in memory for session.
        // For "real" feel, let's just show them.
        setNotifications(prev => {
            // Simple de-dupe based on ID
            const existingIds = new Set(prev.map(n => n.id));
            const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
            return [...uniqueNew, ...prev].sort((a, b) => b.date.localeCompare(a.date));
        });
    };

    useEffect(() => {
        refreshNotifications();
        // Poll every minute or on route change? For now, just once on mount/user-change is enough.
    }, [user]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll, refreshNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
