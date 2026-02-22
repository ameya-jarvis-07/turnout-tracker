import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { AttendanceChartComponent } from '../../shared/components/attendance-chart/attendance-chart.component';
import { AttendanceService } from '../../shared/services/attendance.service';
import { AttendanceSessionService } from '../../shared/services/attendance-session.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeviceFingerprintService } from '../../../core/services/device-fingerprint.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    StatsCardComponent,
    AttendanceChartComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        
        <main class="main-content">
          <div class="page-header">
            <h1>Student Dashboard</h1>
            <p>Track your attendance and performance</p>
          </div>

          <div class="stats-grid">
            <app-stats-card
              title="Overall Attendance"
              [value]="overallAttendance()"
              suffix="%"
              icon="📊"
              iconBackground="linear-gradient(135deg, #7c9cbf, #8b9dc3)"
              [trend]="overallAttendance() >= 75 ? 'up' : 'down'"
              [trendValue]="overallAttendance() >= 75 ? 'Good' : 'Low'"
            ></app-stats-card>

            <app-stats-card
              title="Total Subjects"
              [value]="totalSubjects()"
              icon="📚"
              iconBackground="linear-gradient(135deg, #8b9dc3, #7c9cbf)"
            ></app-stats-card>

            <app-stats-card
              title="Classes This Month"
              [value]="classesThisMonth()"
              icon="📅"
              iconBackground="linear-gradient(135deg, #7bc043, #6aa839)"
            ></app-stats-card>

            <app-stats-card
              title="Active Sessions"
              [value]="activeSessions().length"
              icon="🟢"
              iconBackground="linear-gradient(135deg, #ffa62b, #ff9020)"
              subtitle="Available now"
            ></app-stats-card>
          </div>

          @if (activeSessions().length > 0) {
            <div class="active-sessions clay-card">
              <h2>Mark Attendance</h2>
              <p class="section-subtitle">Active sessions available for attendance</p>
              <div class="sessions-grid">
                @for (session of activeSessions(); track session.sessionId) {
                  <div class="session-card clay-card-inset">
                    <div class="session-header">
                      <h3>{{ session.subjectName }}</h3>
                      <span class="status-badge clay-badge success">Active</span>
                    </div>
                    <div class="session-details">
                      <p><strong>Faculty:</strong> {{ session.facultyName }}</p>
                      <p><strong>Started:</strong> {{ formatTime(session.startTime) }}</p>
                      <p><strong>Students:</strong> {{ session.totalStudentsMarked }} marked</p>
                    </div>
                    <button 
                      class="clay-button primary full-width"
                      [disabled]="markingAttendance()"
                      (click)="markAttendance(session.subjectId)">
                      @if (markingAttendance()) {
                        <span>Marking...</span>
                      } @else {
                        <span>Mark Attendance</span>
                      }
                    </button>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="no-sessions clay-card">
              <div class="empty-state">
                <span class="empty-icon">⏰</span>
                <h3>No Active Sessions</h3>
                <p>There are no attendance sessions open at the moment.</p>
                <p>Check back when your faculty opens a session!</p>
              </div>
            </div>
          }

          @if (attendanceReports().length > 0) {
            <div class="attendance-summary clay-card">
              <h2>Your Attendance Summary</h2>
              <div class="reports-grid">
                @for (report of attendanceReports(); track report.subjectId) {
                  <div class="report-card clay-card-inset"
                       [routerLink]="['/student/subject-report', report.subjectId]">
                    <h3>{{ report.subjectName }}</h3>
                    <div class="progress-container">
                      <div class="progress-bar clay-progress">
                        <div class="clay-progress-bar" 
                             [style.width.%]="report.attendancePercentage"></div>
                      </div>
                      <span class="percentage" 
                            [class.low]="report.attendancePercentage < 75"
                            [class.good]="report.attendancePercentage >= 75">
                        {{ report.attendancePercentage.toFixed(1) }}%
                      </span>
                    </div>
                    <div class="report-stats">
                      <span>{{ report.presentCount }}/{{ report.totalClasses }} classes</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (chartData().labels.length > 0) {
            <app-attendance-chart
              [chartType]="'line'"
              [title]="'Attendance Trend'"
              [labels]="chartData().labels"
              [datasets]="chartData().datasets"
            ></app-attendance-chart>
          }

          @if (lowAttendanceWarning()) {
            <div class="warning-banner clay-card">
              <div class="warning-content">
                <span class="warning-icon">⚠️</span>
                <div>
                  <h3>Low Attendance Warning</h3>
                  <p>Your attendance is below 75% in some subjects. Please improve your attendance!</p>
                </div>
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .section-subtitle {
      margin: -0.5rem 0 1rem 0;
      color: #718096;
      font-size: 0.875rem;
    }

    .active-sessions, .no-sessions {
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .sessions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      }

      .session-card {
        padding: 1.5rem;

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          h3 {
            margin: 0;
            font-size: 1.125rem;
            color: #2d3748;
          }
        }

        .session-details {
          margin-bottom: 1.5rem;

          p {
            margin: 0.5rem 0;
            font-size: 0.875rem;
            color: #718096;

            strong {
              color: #2d3748;
            }
          }
        }
      }
    }

    .no-sessions {
      .empty-state {
        text-align: center;
        padding: 3rem 2rem;

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        h3 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
        }

        p {
          margin: 0.25rem 0;
          color: #718096;
          font-size: 0.875rem;
        }
      }
    }

    .attendance-summary {
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .report-card {
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }

        h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #2d3748;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;

          .progress-bar {
            flex: 1;
          }

          .percentage {
            font-weight: 700;
            font-size: 1.125rem;
            color: #2d3748;
            min-width: 60px;
            text-align: right;

            &.low {
              color: #ee4266;
            }

            &.good {
              color: #7bc043;
            }
          }
        }

        .report-stats {
          font-size: 0.875rem;
          color: #718096;
        }
      }
    }

    .warning-banner {
      background: linear-gradient(135deg, rgba(255, 166, 43, 0.1), rgba(238, 66, 102, 0.1));
      border-left: 4px solid #ffa62b;

      .warning-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        .warning-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        h3 {
          margin: 0 0 0.25rem 0;
          color: #2d3748;
          font-size: 1.125rem;
        }

        p {
          margin: 0;
          color: #718096;
          font-size: 0.875rem;
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
    }

    @media (max-width: 576px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .sessions-grid, .reports-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private sessionService = inject(AttendanceSessionService);
  private authService = inject(AuthService);
  private deviceService = inject(DeviceFingerprintService);

  overallAttendance = signal(0);
  totalSubjects = signal(0);
  classesThisMonth = signal(0);
  activeSessions = signal<any[]>([]);
  attendanceReports = signal<any[]>([]);
  lowAttendanceWarning = signal(false);
  markingAttendance = signal(false);
  chartData = signal({ labels: [] as string[], datasets: [] as any[] });

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/student/dashboard', icon: '🏠' },
    { label: 'Mark Attendance', route: '/student/mark-attendance', icon: '✓' },
    { label: 'My Attendance', route: '/student/my-attendance', icon: '📋' },
    { label: 'Reports', route: '/student/reports', icon: '📊' },
    { label: 'Trends', route: '/student/trends', icon: '📈' }
  ];

  ngOnInit() {
    this.loadActiveSessions();
    this.loadAttendanceReports();
  }

  private loadActiveSessions() {
    this.sessionService.getAllActiveSessions().subscribe({
      next: (sessions) => this.activeSessions.set(sessions),
      error: (error) => console.error('Failed to load sessions:', error)
    });
  }

  private loadAttendanceReports() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.attendanceService.getAllAttendanceReports(currentUser.userId).subscribe({
        next: (reports) => {
          this.attendanceReports.set(reports);
          this.calculateStats(reports);
        },
        error: (error) => console.error('Failed to load reports:', error)
      });
    }
  }

  private calculateStats(reports: any[]) {
    if (reports.length === 0) return;

    const totalPercentage = reports.reduce((sum, r) => sum + r.attendancePercentage, 0);
    this.overallAttendance.set(Math.round(totalPercentage / reports.length));
    this.totalSubjects.set(reports.length);

    const hasLowAttendance = reports.some(r => r.attendancePercentage < 75);
    this.lowAttendanceWarning.set(hasLowAttendance);

    // Prepare chart data
    const labels = reports.map(r => r.subjectName);
    const data = reports.map(r => r.attendancePercentage);

    this.chartData.set({
      labels,
      datasets: [{
        label: 'Attendance %',
        data,
        borderColor: '#7c9cbf',
        backgroundColor: 'rgba(124, 156, 191, 0.1)',
        tension: 0.4
      }]
    });
  }

  async markAttendance(subjectId: number) {
    this.markingAttendance.set(true);

    try {
      const deviceFingerprintHash = await this.deviceService.getFingerprint();
      
      this.attendanceService.markAttendance({ subjectId, deviceFingerprintHash }).subscribe({
        next: () => {
          alert('Attendance marked successfully!');
          this.loadActiveSessions();
          this.loadAttendanceReports();
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
}
