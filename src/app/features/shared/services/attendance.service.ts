import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AttendanceDto,
  MarkAttendanceDto,
  AttendanceReportDto,
  MonthlyAttendanceDto
} from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly API_URL = `${environment.apiUrl}/Attendance`;
  
  // Signals for reactive state
  myAttendance = signal<AttendanceDto[]>([]);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  markAttendance(data: MarkAttendanceDto): Observable<any> {
    return this.http.post(`${this.API_URL}/mark`, data);
  }

  getMyAttendance(): Observable<AttendanceDto[]> {
    this.loading.set(true);
    return this.http.get<AttendanceDto[]>(`${this.API_URL}/my-attendance`).pipe(
      tap({
        next: (attendance) => {
          this.myAttendance.set(attendance);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  getAttendanceBySubject(subjectId: number): Observable<AttendanceDto[]> {
    return this.http.get<AttendanceDto[]>(`${this.API_URL}/subject/${subjectId}`);
  }

  getAttendanceReport(userId: number, subjectId: number): Observable<AttendanceReportDto> {
    return this.http.get<AttendanceReportDto>(`${this.API_URL}/report/${userId}/${subjectId}`);
  }

  getMonthlyTrends(userId: number, subjectId: number): Observable<MonthlyAttendanceDto[]> {
    return this.http.get<MonthlyAttendanceDto[]>(
      `${this.API_URL}/monthly-trends/${userId}/${subjectId}`
    );
  }

  getAllAttendanceReports(userId: number): Observable<AttendanceReportDto[]> {
    return this.http.get<AttendanceReportDto[]>(`${this.API_URL}/reports/${userId}`);
  }

  refreshMyAttendance(): void {
    this.getMyAttendance().subscribe();
  }
}
