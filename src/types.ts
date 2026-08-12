export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  /**
   * Password is stored as a SHA-256 hex hash (see src/utils/crypto.ts).
   * Never stored in plaintext.
   */
  password?: string;
  avatar?: string;
  bio?: string;
  is2FA?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  userId?: string;
  name: string;
  /** Integer ISO currency minor units. Never persist a decimal money value. */
  priceMinor: number;
  description?: string;
  image?: string; // Base64 encoded image or URL
  inventory?: number; // Current stock quantity
  category?: string;
  createdAt: string;
}

export interface IncomeEntry {
  id: string;
  userId?: string;
  productId: string;
  quantity: number;
  /** Integer ISO currency minor units. Never persist a decimal money value. */
  amountMinor: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  userId?: string;
  category: string;
  amountMinor: number;
  date: string;
  description: string;
}

export interface BusinessSubscription {
  id: string;
  userId?: string;
  name: string;
  amountMinor: number;
  billingCycle: 'monthly' | 'yearly';
  category: string;
  nextBillingDate: string;
  status: 'active' | 'paused' | 'cancelled';
}

export interface CustomerSubscription {
  id: string;
  userId?: string;
  customerName: string;
  serviceName: string;
  amountMinor: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  nextBillingDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  notes?: string;
}

export interface ProductWithIncome extends Product {
  totalIncomeMinor: number;
  totalQuantity: number;
  lastSaleDate?: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

/**
 * All navigable view names used throughout the app.
 * Centralising here prevents typos and enables strict prop typing
 * across Header, Sidebar, and App without using loose `string` or `any`.
 */
export type View =
  | 'dashboard'
  | 'sales'
  | 'products'
  | 'analytics'
  | 'settings'
  | 'expenses'
  | 'subscriptions';
