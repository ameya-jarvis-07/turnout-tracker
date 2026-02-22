import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, interval } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AttendanceSessionDto, OpenAttendanceSessionDto } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceSessionService {
  private readonly API_URL = `${environment.apiUrl}/AttendanceSession`;
  
  // Signals for reactive state
  activeSessions = signal<AttendanceSessionDto[]>([]);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  openSession(data: OpenAttendanceSessionDto): Observable<AttendanceSessionDto> {
    return this.http.post<AttendanceSessionDto>(`${this.API_URL}/open`, data).pipe(
      tap(session => {
        const current = this.activeSessions();
        this.activeSessions.set([...current, session]);
      })
    );
  }

  closeSession(sessionId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/close/${sessionId}`, {}).pipe(
      tap(() => {
        const current = this.activeSessions();
        const updated = current.filter(s => s.sessionId !== sessionId);
        this.activeSessions.set(updated);
      })
    );
  }

  getActiveSessionBySubject(subjectId: number): Observable<AttendanceSessionDto | null> {
    return this.http.get<AttendanceSessionDto>(`${this.API_URL}/active/${subjectId}`);
  }

  getSessionById(sessionId: number): Observable<AttendanceSessionDto> {
    return this.http.get<AttendanceSessionDto>(`${this.API_URL}/${sessionId}`);
  }

  getAllActiveSessions(): Observable<AttendanceSessionDto[]> {
    this.loading.set(true);
    return this.http.get<AttendanceSessionDto[]>(`${this.API_URL}/active`).pipe(
      tap({
        next: (sessions) => {
          this.activeSessions.set(sessions);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  getSessionHistory(facultyId?: number): Observable<AttendanceSessionDto[]> {
    const url = facultyId 
      ? `${this.API_URL}/history?facultyId=${facultyId}`
      : `${this.API_URL}/history`;
    return this.http.get<AttendanceSessionDto[]>(url);
  }

  private startPolling(): void {
    // Poll for active sessions every 30 seconds
    interval(30000).subscribe(() => {
      this.getAllActiveSessions().subscribe();
    });
  }

  refreshActiveSessions(): void {
    this.getAllActiveSessions().subscribe();
  }
}
