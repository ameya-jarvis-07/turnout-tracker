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
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/Admin`;
  
  // Signals for reactive state
  deviceRequests = signal<DeviceChangeRequestDto[]>([]);
  dashboardStats = signal<DashboardStatsDto | null>(null);
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
}
