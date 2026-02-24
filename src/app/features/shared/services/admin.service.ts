import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DeviceChangeRequestDto } from '../../../core/models/auth.model';
import { UserDto } from '../../../core/models/user.model';

export interface ReviewDeviceChangeDto {
  approved: boolean;
  reviewNotes?: string;
}

export interface LowAttendanceStudentDto {
  userId: number;
  userName: string;
  email: string;
  subjectId: number;
  subjectName: string;
  attendancePercentage: number;
  totalClasses: number;
  presentCount: number;
}

export interface DashboardStatsDto {
  totalStudents: number;
  totalFaculty: number;
  totalSubjects: number;
  pendingDeviceRequests: number;
  overallAttendanceRate: number;
  lowAttendanceStudentsCount: number;
  activeSessions?: number;
  todayAttendance?: number;
  thisMonthSessions?: number;
  newUsersThisMonth?: number;
  averageSessionDuration?: number;
}

export interface ActivityLogDto {
  activityId: number;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface SystemHealthDto {
  status: 'good' | 'warning' | 'critical';
  cpuUsage?: number;
  memoryUsage?: number;
  databaseStatus: string;
  apiResponseTime?: number;
  activeUsers: number;
  lastBackupTime?: Date;
}

export interface ReportExportDto {
  reportType: 'attendance' | 'users' | 'subjects' | 'sessions' | 'low-attendance';
  format: 'csv' | 'pdf' | 'excel';
  dateFrom?: Date;
  dateTo?: Date;
  filters?: Record<string, any>;
}

export interface BulkActionDto {
  action: 'delete' | 'activate' | 'deactivate' | 'approve' | 'reject';
  entityType: 'users' | 'subjects' | 'requests';
  entityIds: number[];
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/Admin`;
  
  // Signals for reactive state
  deviceRequests = signal<DeviceChangeRequestDto[]>([]);
  dashboardStats = signal<DashboardStatsDto | null>(null);
  activityLogs = signal<ActivityLogDto[]>([]);
  systemHealth = signal<SystemHealthDto | null>(null);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  // Device Change Requests
  getDeviceChangeRequests(): Observable<DeviceChangeRequestDto[]> {
    this.loading.set(true);
    return this.http.get<DeviceChangeRequestDto[]>(
      `${this.API_URL}/device-change-requests`
    ).pipe(
      tap({
        next: (requests) => {
          this.deviceRequests.set(requests);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  reviewDeviceChangeRequest(
    requestId: number,
    review: ReviewDeviceChangeDto
  ): Observable<any> {
    return this.http.post(
      `${this.API_URL}/device-change-requests/${requestId}/review`,
      review
    ).pipe(
      tap(() => {
        const current = this.deviceRequests();
        const updated = current.filter(r => r.requestId !== requestId);
        this.deviceRequests.set(updated);
      })
    );
  }

  // Low Attendance Reports
  getLowAttendanceStudents(threshold: number = 75): Observable<LowAttendanceStudentDto[]> {
    return this.http.get<LowAttendanceStudentDto[]>(
      `${this.API_URL}/low-attendance?threshold=${threshold}`
    );
  }

  // Dashboard Statistics
  getDashboardStats(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${this.API_URL}/dashboard-stats`).pipe(
      tap(stats => this.dashboardStats.set(stats))
    );
  }

  // User Management
  getAllUsers(role?: string): Observable<UserDto[]> {
    const url = role ? `${this.API_URL}/users?role=${role}` : `${this.API_URL}/users`;
    return this.http.get<UserDto[]>(url);
  }

  getUserById(userId: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.API_URL}/users/${userId}`);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${userId}`);
  }

  refreshDeviceRequests(): void {
    this.getDeviceChangeRequests().subscribe();
  }

  refreshDashboardStats(): void {
    this.getDashboardStats().subscribe();
  }

  // Activity Logs
  getActivityLogs(limit: number = 50): Observable<ActivityLogDto[]> {
    return this.http.get<ActivityLogDto[]>(`${this.API_URL}/activity-logs?limit=${limit}`).pipe(
      tap(logs => this.activityLogs.set(logs))
    );
  }

  // System Health
  getSystemHealth(): Observable<SystemHealthDto> {
    return this.http.get<SystemHealthDto>(`${this.API_URL}/system-health`).pipe(
      tap(health => this.systemHealth.set(health))
    );
  }

  // Export Reports
  exportReport(reportConfig: ReportExportDto): Observable<Blob> {
    return this.http.post(`${this.API_URL}/export-report`, reportConfig, {
      responseType: 'blob'
    });
  }

  // Bulk Actions
  performBulkAction(bulkAction: BulkActionDto): Observable<any> {
    return this.http.post(`${this.API_URL}/bulk-action`, bulkAction);
  }

  // Advanced User Management
  toggleUserStatus(userId: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/${userId}/status`, { isActive });
  }

  resetUserPassword(userId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/reset-password`, {});
  }

  // Subject Management
  assignFacultyToSubject(subjectId: number, facultyId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/subjects/${subjectId}/assign-faculty`, { facultyId });
  }

  // Analytics
  getAttendanceTrends(period: 'week' | 'month' | 'year'): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/analytics/attendance-trends?period=${period}`);
  }

  getUserGrowthStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/analytics/user-growth`);
  }

  getSubjectPerformance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/analytics/subject-performance`);
  }

  // System Maintenance
  clearCache(): Observable<any> {
    return this.http.post(`${this.API_URL}/maintenance/clear-cache`, {});
  }

  generateBackup(): Observable<any> {
    return this.http.post(`${this.API_URL}/maintenance/backup`, {});
  }

  // Notifications
  sendBulkNotification(notification: { title: string; message: string; userIds?: number[]; role?: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/notifications/send-bulk`, notification);
  }
}
