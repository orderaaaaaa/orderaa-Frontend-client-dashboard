export interface EmployeeSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAccessLevel: string;
  onAccessLevelChange: (level: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
  selectedPerformance: string;
  onPerformanceChange: (performance: string) => void;
  placeholder?: string;
  className?: string;
}

