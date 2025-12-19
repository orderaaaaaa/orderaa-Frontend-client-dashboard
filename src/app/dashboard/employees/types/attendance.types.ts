export interface EmployeeAttendanceResponse {
  employeeId: number;
  fullName: string;
  attendanceDates: string[];
  leaveDates: string[];
  month: string;
  statistics: {
    totalWorkingDays: number;
    attendedDays: number;
    leaveDays: number;
    attendancePercentage: number;
  };
}

export interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
  type: 'attendance' | 'leave';
}

