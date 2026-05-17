import { apiClient } from './client';

export interface Category {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export async function createCategory(data: { name: string }): Promise<Category> {
  return apiClient.post<Category>('/api/categories', data);
}

export async function getCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>('/api/categories');
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/categories/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
