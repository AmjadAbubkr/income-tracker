import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import type { Category } from '../api/categories';
import { useAuth } from '../context/AuthContext';

export function useCategories() {
  const { user } = useAuth();
  return useQuery<Category[], Error>({
    queryKey: ['categories', user?.id],
    queryFn: getCategories,
    enabled: Boolean(user),
    staleTime: 60000,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const create = useMutation<Category, Error, { name: string }>({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });

  const remove = useMutation<{ message: string }, Error, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
    },
  });

  return { create, delete: remove };
}
