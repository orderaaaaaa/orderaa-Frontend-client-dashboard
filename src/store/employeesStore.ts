import { create } from 'zustand';
import { FILTER_ALL } from '@/app/dashboard/employees/constants/employeesFilterOptions';

type FilterSelections = {
  accessLevel: string;
  department: string;
  performance: string;
  limit: number;
};

interface EmployeesStore {
  // Search state (debounced in component, but stored here)
  debouncedSearchQuery: string;
  setDebouncedSearchQuery: (query: string) => void;

  // Filter selections
  filterSelections: FilterSelections;
  setAccessLevel: (level: string) => void;
  setDepartment: (department: string) => void;
  setPerformance: (performance: string) => void;
  setLimit: (limit: number) => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;

  // Reset all filters
  clearFilters: () => void;
}

const initialFilterSelections: FilterSelections = {
  accessLevel: FILTER_ALL,
  department: FILTER_ALL,
  performance: FILTER_ALL,
  limit: 10,
};

export const useEmployeesStore = create<EmployeesStore>((set) => ({
  debouncedSearchQuery: '',
  setDebouncedSearchQuery: (query) => set({ debouncedSearchQuery: query }),

  filterSelections: initialFilterSelections,
  setAccessLevel: (level) =>
    set((state) => ({
      filterSelections: { ...state.filterSelections, accessLevel: level },
    })),
  setDepartment: (department) =>
    set((state) => ({
      filterSelections: { ...state.filterSelections, department },
    })),
  setPerformance: (performance) =>
    set((state) => ({
      filterSelections: { ...state.filterSelections, performance },
    })),
  setLimit: (limit) =>
    set((state) => ({
      filterSelections: { ...state.filterSelections, limit },
    })),

  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),

  clearFilters: () =>
    set({
      debouncedSearchQuery: '',
      filterSelections: initialFilterSelections,
      currentPage: 1,
    }),
}));
