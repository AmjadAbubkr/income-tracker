import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import type { Product } from '../types';

export function useProducts() {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 30000,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const create = useMutation<Product, Error, Omit<Product, 'id' | 'createdAt'>>({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const update = useMutation<
    Product,
    Error,
    { id: string; data: Partial<Omit<Product, 'id' | 'createdAt'>> }
  >({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const remove = useMutation<{ message: string }, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return { create, update, delete: remove };
}
