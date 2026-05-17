import { apiClient } from './client';
import type { Product } from '../types';

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'userId'>
): Promise<Product> {
  return apiClient.post<Product>('/api/products', {
    ...data,
    price: data.price.toString(),
  });
}

export async function getProducts(): Promise<Product[]> {
  return apiClient.get<Product[]>('/api/products');
}

export async function getProduct(id: string): Promise<Product> {
  return apiClient.get<Product>(`/api/products/${id}`);
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'userId'>>
): Promise<Product> {
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.price !== undefined) body.price = data.price.toString();
  if (data.description !== undefined) body.description = data.description;
  if (data.image !== undefined) body.image = data.image;
  if (data.inventory !== undefined) body.inventory = data.inventory;
  if (data.category !== undefined) body.category = data.category;

  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/products/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
