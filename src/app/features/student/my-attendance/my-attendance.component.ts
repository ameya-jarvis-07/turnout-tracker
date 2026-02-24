import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AttendanceService } from '../../shared/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>My Attendance</h1>
            <p>View your detailed attendance records across all subjects</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card clay-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">{{ overallAttendance().toFixed(1) }}%</div>
                <div class="stat-label">Overall Attendance</div>
              </div>
            </div>
            <div class="stat-card clay-card">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <div class="stat-value">{{ attendanceRecords().length }}</div>
                <div class="stat-label">Total Subjects</div>
              </div>
            </div>
            <div class="stat-card clay-card">
              <div class="stat-icon">✓</div>
              <div class="stat-content">
                <div class="stat-value">{{ totalPresent() }}</div>
                <div class="stat-label">Classes Attended</div>
              </div>
            </div>
            <div class="stat-card clay-card">
              <div class="stat-icon">✕</div>
              <div class="stat-content">
                <div class="stat-value">{{ totalAbsent() }}</div>
                <div class="stat-label">Classes Missed</div>
              </div>
            </div>
          </div>

          @if (attendanceRecords().length > 0) {
            <div class="records-list">
              @for (record of attendanceRecords(); track record.subjectId) {
                <div class="record-card clay-card">
                  <div class="record-header">
                    <div>
                      <h3>{{ record.subjectName }}</h3>
                      <p class="subject-code">{{ record.subjectCode }}</p>
                    </div>
                    <span class="percentage-badge" [ngClass]="getAttendanceClass(record.attendancePercentage)">
                      {{ record.attendancePercentage.toFixed(1) }}%
                    </span>
                  </div>

                  <div class="progress-container">
                    <div class="progress-bar clay-progress">
                      <div class="clay-progress-bar" [style.width.%]="record.attendancePercentage"></div>
                    </div>
                  </div>

                  <div class="record-details">
                    <div class="detail">
                      <span class="label">Classes Attended:</span>
                      <span class="value">{{ record.presentCount }}/{{ record.totalClasses }}</span>
                    </div>
                    <div class="detail">
                      <span class="label">Faculty:</span>
                      <span class="value">{{ record.facultyName }}</span>
                    </div>
                    <div class="detail">
                      <span class="label">Status:</span>
                      <span class="status" [class.good]="record.attendancePercentage >= 75" [class.low]="record.attendancePercentage < 75">
                        {{ record.attendancePercentage >= 75 ? '✓ Good' : '⚠️ Low' }}
                      </span>
                    </div>
                  </div>

                  <button class="clay-button full-width secondary" [routerLink]="['/student/subject-report', record.subjectId]">
                    View Detailed Report
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>No attendance records found</p>
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
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;

      .stat-card {
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #7c9cbf;
            margin-bottom: 0.25rem;
          }

          .stat-label {
            font-size: 0.75rem;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
      }
    }

    .records-list {
      display: grid;
      gap: 1.5rem;
    }

    .record-card {
      padding: 1.5rem;

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 1rem;
        border-bottom: 2px solid rgba(124, 156, 191, 0.2);
        padding-bottom: 1rem;

        h3 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 1.125rem;
        }

        .subject-code {
          margin: 0;
          color: #718096;
          font-size: 0.875rem;
          font-family: monospace;
        }

        .percentage-badge {
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-weight: 700;
          font-size: 1rem;

          &.good {
            background: rgba(123, 192, 67, 0.2);
            color: #7bc043;
          }

          &.low {
            background: rgba(238, 66, 102, 0.2);
            color: #ee4266;
          }
        }
      }

      .progress-container {
        margin-bottom: 1.5rem;

        .progress-bar {
          height: 8px;
          background: rgba(124, 156, 191, 0.1);
          border-radius: 4px;
          overflow: hidden;

          .clay-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #7c9cbf, #8b9dc3);
            border-radius: 4px;
          }
        }
      }

      .record-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;

        .detail {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .label {
            font-size: 0.75rem;
            color: #718096;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .value {
            font-size: 0.975rem;
            color: #2d3748;
            font-weight: 600;
          }

          .status {
            font-size: 0.875rem;
            font-weight: 600;

            &.good {
              color: #7bc043;
            }

            &.low {
              color: #ee4266;
            }
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .record-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyAttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  attendanceRecords = signal<any[]>([]);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/student/dashboard', icon: '🏠' },
    { label: 'Mark Attendance', route: '/student/mark-attendance', icon: '✓' },
    { label: 'My Attendance', route: '/student/my-attendance', icon: '📋' },
    { label: 'Reports', route: '/student/reports', icon: '📊' },
    { label: 'Trends', route: '/student/trends', icon: '📈' }
  ];

  ngOnInit() {
    this.loadAttendanceRecords();
  }

  private loadAttendanceRecords() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.attendanceService.getAllAttendanceReports(currentUser.userId).subscribe({
        next: (records) => this.attendanceRecords.set(records),
        error: (error) => console.error('Failed to load attendance records:', error)
      });
    }
  }

  overallAttendance(): number {
    const records = this.attendanceRecords();
    if (records.length === 0) return 0;
    return records.reduce((sum, r) => sum + r.attendancePercentage, 0) / records.length;
  }

  totalPresent(): number {
    return this.attendanceRecords().reduce((sum, r) => sum + r.presentCount, 0);
  }

  totalAbsent(): number {
    return this.attendanceRecords().reduce((sum, r) => sum + (r.totalClasses - r.presentCount), 0);
  }

  getAttendanceClass(percentage: number): string {
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'medium';
    return 'low';
  }
}
