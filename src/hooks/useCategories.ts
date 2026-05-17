import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import type { Category } from '../api/categories';

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 60000,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const create = useMutation<Category, Error, { name: string }>({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const remove = useMutation<{ message: string }, Error, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return { create, delete: remove };
}
