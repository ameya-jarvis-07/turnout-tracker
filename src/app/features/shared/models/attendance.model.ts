export interface AttendanceDto {
  attendanceId: number;
  userId: number;
  userName: string;
  subjectId: number;
  subjectName: string;
  date: Date;
  status: 'Present' | 'Absent';
  markedAt: Date;
  deviceId: number;
  ipAddress?: string;
}

export interface MarkAttendanceDto {
  subjectId: number;
  deviceFingerprintHash: string;
}

export interface AttendanceReportDto {
  userId: number;
  userName: string;
  email: string;
  subjectId: number;
  subjectName: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface MonthlyAttendanceDto {
  month: number;
  year: number;
  totalClasses: number;
  presentCount: number;
  attendancePercentage: number;
}

export interface AttendanceSessionDto {
  sessionId: number;
  subjectId: number;
  subjectName: string;
  startTime: Date;
  endTime?: Date;
  isOpen: boolean;
  openedByFacultyId: number;
  facultyName: string;
  totalStudentsMarked: number;
}

export interface OpenAttendanceSessionDto {
  subjectId: number;
}
