import { storage } from '../utils/storage';

export interface Category {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export async function createCategory(data: { name: string }): Promise<Category> {
  const newCategory: Category = {
    id: crypto.randomUUID(),
    name: data.name,
    createdAt: new Date().toISOString(),
    userId: '', // This will be set by the database layer for the active user
  };
  await storage.addCategory(newCategory);
  return newCategory;
}

export async function getCategories(): Promise<Category[]> {
  return storage.getCategories();
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  await storage.deleteCategory(id);
  return { message: 'Category deleted successfully' };
}
