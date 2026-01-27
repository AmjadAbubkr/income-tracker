export interface Product {
  id: string;
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
  productId: string;
  quantity: number;
  amount: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface BusinessSubscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  category: string;
  nextBillingDate: string;
  status: 'active' | 'paused' | 'cancelled';
}

export interface CustomerSubscription {
  id: string;
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

