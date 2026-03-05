export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  password?: string; // In a real app, this would be hashed. Storing simply here for local demo.
  avatar?: string;
  bio?: string;
  is2FA?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  userId?: string;
  name: string;
  price: number;
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
  amount: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  userId?: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface BusinessSubscription {
  id: string;
  userId?: string;
  name: string;
  amount: number;
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
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  nextBillingDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  notes?: string;
}

export interface ProductWithIncome extends Product {
  totalIncome: number;
  totalQuantity: number;
  lastSaleDate?: string;
}

