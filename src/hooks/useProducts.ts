import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import type { Product } from '../types';
import { useAuth } from '../context/AuthContext';

export function useProducts() {
  const { user } = useAuth();
  return useQuery<Product[], Error>({
    queryKey: ['products', user?.id],
    queryFn: getProducts,
    enabled: Boolean(user),
    staleTime: 30000,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const create = useMutation<Product, Error, Omit<Product, 'id' | 'createdAt'>>({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });

  const update = useMutation<
    Product,
    Error,
    { id: string; data: Partial<Omit<Product, 'id' | 'createdAt'>> }
  >({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });

  const remove = useMutation<{ message: string }, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });

  return { create, update, delete: remove };
}
