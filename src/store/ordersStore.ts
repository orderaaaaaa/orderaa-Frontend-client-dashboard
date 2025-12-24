import { create } from 'zustand';
import { OrderStatus } from '@/types/orders';

interface OrdersStore {
  searchQuery: string;
  selectedStatus: OrderStatus | null;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: OrderStatus | null) => void;
  clearFilters: () => void;
  initializeFromUrl: (status: OrderStatus | null, search: string) => void;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  searchQuery: '',
  selectedStatus: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  clearFilters: () => set({ searchQuery: '', selectedStatus: null }),
  initializeFromUrl: (status, search) => set({ selectedStatus: status, searchQuery: search }),
}));
