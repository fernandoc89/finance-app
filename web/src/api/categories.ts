import type {
  Category,
  CategoryStat,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category';
import { api } from './client';

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function fetchCategoryStats(
  startDate?: string,
  endDate?: string,
): Promise<CategoryStat[]> {
  const { data } = await api.get<CategoryStat[]>('/categories/stats', {
    params: { startDate, endDate },
  });
  return data;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const { data } = await api.post<Category>('/categories', payload);
  return data;
}

export async function createDefaultCategories(): Promise<Category[]> {
  const { data } = await api.post<Category[]>('/categories/defaults');
  return data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
