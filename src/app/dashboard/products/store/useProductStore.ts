import { create } from 'zustand';
import { ProductState } from '../types/products';

export const useProductStore = create<ProductState>((set) => ({
  page: 1,
  limit: 10,
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
}));
