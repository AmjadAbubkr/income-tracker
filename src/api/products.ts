import { storage } from '../utils/storage';
import type { Product } from '../types';

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'userId'>
): Promise<Product> {
  const newProduct: Product = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await storage.addProduct(newProduct);
  return newProduct;
}

export async function getProducts(): Promise<Product[]> {
  return storage.getProducts();
}

export async function getProduct(id: string): Promise<Product> {
  const all = await storage.getProducts();
  const product = all.find(p => p.id === id);
  if (!product) throw new Error('Product not found');
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'userId'>>
): Promise<Product> {
  return storage.updateProduct(id, data);
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  await storage.deleteProduct(id);
  return { message: 'Product deleted successfully' };
}
