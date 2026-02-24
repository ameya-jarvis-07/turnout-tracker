import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AttendanceSessionService } from '../../shared/services/attendance-session.service';
import { AttendanceService } from '../../shared/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeviceFingerprintService } from '../../../core/services/device-fingerprint.service';

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>Mark Attendance</h1>
            <p>Join active attendance sessions and mark your presence</p>
          </div>

          @if (activeSessions().length > 0) {
            <div class="sessions-container">
              <div class="info-banner clay-card">
                <span class="info-icon">ℹ️</span>
                <p>
                  Active sessions are displayed below. Click the "Mark Attendance" button to record your presence.
                  Your device will be fingerprinted for security verification.
                </p>
              </div>

              <div class="sessions-grid">
                @for (session of activeSessions(); track session.sessionId) {
                  <div class="session-card clay-card">
                    <div class="session-header">
                      <h3>{{ session.subjectName }}</h3>
                      <span class="status-badge active">Active</span>
                    </div>

                    <div class="session-info">
                      <div class="info-row">
                        <span class="label">Subject Code:</span>
                        <span class="value">{{ session.subjectCode }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Faculty:</span>
                        <span class="value">{{ session.facultyName }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Started:</span>
                        <span class="value">{{ formatTime(session.startTime) }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Students Marked:</span>
                        <span class="value">{{ session.totalStudentsMarked }}</span>
                      </div>
                    </div>

                    <button
                      class="clay-button primary full-width"
                      [disabled]="markingAttendance() || hasMarkedSession(session.sessionId)"
                      (click)="markAttendance(session.subjectId, session.sessionId)">
                      @if (markingAttendance()) {
                        <span>Marking in progress...</span>
                      } @else if (hasMarkedSession(session.sessionId)) {
                        <span>✓ Already Marked</span>
                      } @else {
                        <span>✓ Mark Attendance</span>
                      }
                    </button>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="empty-state clay-card">
              <div class="empty-content">
                <span class="empty-icon">⏰</span>
                <h3>No Active Sessions</h3>
                <p>There are no attendance sessions open at the moment.</p>
                <p>Check back when your faculty opens a session!</p>
              </div>
            </div>
          }

          @if (markedSessions().length > 0) {
            <div class="marked-sessions clay-card">
              <h2>📋 Sessions You've Already Marked</h2>
              <div class="marked-list">
                @for (session of markedSessions(); track session.sessionId) {
                  <div class="marked-item">
                    <div>
                      <h4>{{ session.subjectName }}</h4>
                      <p>Marked at {{ formatDateTime(session.markedTime) }}</p>
                    </div>
                    <span class="check-mark">✓</span>
                  </div>
                }
              </div>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      padding: 1rem;
    }

    .dashboard-content {
      display: flex;
      gap: 2rem;
    }

    .main-content {
      flex: 1;
      min-width: 0;
    }

    .page-header {
      margin-bottom: 2rem;

      h1 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
        font-size: 2rem;
      }

      p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
      }
    }

    .empty-state {
      padding: 3rem;

      .empty-content {
        text-align: center;

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        h3 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 1.5rem;
        }

        p {
          margin: 0.25rem 0;
          color: #718096;
          font-size: 0.875rem;
        }
      }
    }

    .sessions-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: rgba(124, 156, 191, 0.05);
      border-left: 4px solid #7c9cbf;

      .info-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
      }
    }

    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .session-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .session-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 1rem;
        border-bottom: 2px solid rgba(124, 156, 191, 0.2);
        padding-bottom: 1rem;

        h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.125rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(123, 192, 67, 0.2);
          color: #7bc043;

          &.active {
            background: rgba(123, 192, 67, 0.2);
            color: #7bc043;
          }
        }
      }

      .session-info {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;

          .label {
            font-weight: 600;
            color: #2d3748;
          }

          .value {
            color: #718096;
          }
        }
      }
    }

    .marked-sessions {
      margin-top: 2rem;
      padding: 1.5rem;

      h2 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.25rem;
      }

      .marked-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .marked-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(123, 192, 67, 0.05);
        border-radius: 8px;
        border-left: 4px solid #7bc043;

        h4 {
          margin: 0 0 0.25rem 0;
          color: #2d3748;
          font-size: 0.975rem;
        }

        p {
          margin: 0;
          color: #718096;
          font-size: 0.75rem;
        }

        .check-mark {
          font-size: 1.5rem;
          color: #7bc043;
          font-weight: 700;
        }
      }
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .sessions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MarkAttendanceComponent implements OnInit {
  private sessionService = inject(AttendanceSessionService);
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private deviceService = inject(DeviceFingerprintService);

  activeSessions = signal<any[]>([]);
  markedSessions = signal<any[]>([]);
  markingAttendance = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/student/dashboard', icon: '🏠' },
    { label: 'Mark Attendance', route: '/student/mark-attendance', icon: '✓' },
    { label: 'My Attendance', route: '/student/my-attendance', icon: '📋' },
    { label: 'Reports', route: '/student/reports', icon: '📊' },
    { label: 'Trends', route: '/student/trends', icon: '📈' }
  ];

  ngOnInit() {
    this.loadActiveSessions();
    this.loadMarkedSessions();
  }

  private loadActiveSessions() {
    this.sessionService.getAllActiveSessions().subscribe({
      next: (sessions) => this.activeSessions.set(sessions),
      error: (error) => console.error('Failed to load sessions:', error)
    });
  }

  private loadMarkedSessions() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const getMethod = (this.attendanceService as any).getStudentAttendanceHistory || (this.attendanceService as any).getAllAttendanceReports;
      getMethod.call(this.attendanceService, currentUser.userId).subscribe({
        next: (history: any[]) => {
          this.markedSessions.set(history);
        },
        error: (error: any) => console.error('Failed to load marked sessions:', error)
      });
    }
  }

  hasMarkedSession(sessionId: number): boolean {
    return this.markedSessions().some(s => s.sessionId === sessionId);
  }

  async markAttendance(subjectId: number, sessionId: number) {
    this.markingAttendance.set(true);

    try {
      const deviceFingerprintHash = await this.deviceService.getFingerprint();

      this.attendanceService.markAttendance({ subjectId, deviceFingerprintHash }).subscribe({
        next: () => {
          alert('Attendance marked successfully!');
          this.loadActiveSessions();
          this.loadMarkedSessions();
          this.markingAttendance.set(false);
        },
        error: (error) => {
          alert(error.message || 'Failed to mark attendance');
          this.markingAttendance.set(false);
        }
      });
    } catch (error) {
      alert('Failed to get device fingerprint');
      this.markingAttendance.set(false);
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
