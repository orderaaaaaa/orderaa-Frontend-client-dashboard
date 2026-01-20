import { create } from 'zustand';
import { ProductState } from '../types/products';

export const useProductStore = create<ProductState>((set) => ({
  page: 1,
  limit: 10,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
}));
