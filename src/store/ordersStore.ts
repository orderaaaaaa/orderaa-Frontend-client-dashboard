import { create } from 'zustand';

interface OrdersStore {
  searchQuery: string;
  selectedStatus: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: string | null) => void;
  clearFilters: () => void;
  initializeFromUrl: (status: string | null, search: string) => void;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  searchQuery: '',
  selectedStatus: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  clearFilters: () => set({ searchQuery: '', selectedStatus: null }),
  initializeFromUrl: (status, search) => set({ selectedStatus: status, searchQuery: search }),
}));
