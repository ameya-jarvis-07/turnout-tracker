import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AttendanceChartComponent } from '../../shared/components/attendance-chart/attendance-chart.component';
import { AttendanceService } from '../../shared/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-trends',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, AttendanceChartComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>Attendance Trends</h1>
            <p>Analyze your attendance patterns and progress over time</p>
          </div>

          <div class="filters clay-card">
            <div class="filter-group">
              <label for="subject">Filter by Subject:</label>
              <select id="subject" class="clay-input" (change)="onSubjectChange($event)">
                <option value="">All Subjects</option>
                @for (subject of allSubjects(); track subject.subjectId) {
                  <option [value]="subject.subjectId">{{ subject.subjectName }}</option>
                }
              </select>
            </div>
            <div class="filter-group">
              <label for="period">Time Period:</label>
              <select id="period" class="clay-input" (change)="onPeriodChange($event)">
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="semester">This Semester</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          @if (chartData().labels.length > 0) {
            <div class="charts-grid">
              <app-attendance-chart
                [chartType]="'line'"
                [title]="'Attendance Trend'"
                [labels]="chartData().labels"
                [datasets]="linChartData()"
              ></app-attendance-chart>

              <app-attendance-chart
                [chartType]="'bar'"
                [title]="'Weekly Attendance'"
                [labels]="weeklyData().labels"
                [datasets]="weeklyData().datasets"
              ></app-attendance-chart>
            </div>

            <div class="trends-summary clay-card">
              <h2>📊 Trend Analysis</h2>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Current Trend:</span>
                  <span class="value" [ngClass]="getTrendClass()">{{ getCurrentTrend() }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Average Attendance:</span>
                  <span class="value">{{ getAverageAttendance().toFixed(1) }}%</span>
                </div>
                <div class="summary-item">
                  <span class="label">Highest Attendance:</span>
                  <span class="value">{{ getHighestAttendance() }}%</span>
                </div>
                <div class="summary-item">
                  <span class="label">Lowest Attendance:</span>
                  <span class="value">{{ getLowestAttendance() }}%</span>
                </div>
              </div>
            </div>

            <div class="insights clay-card">
              <h2>💡 Insights</h2>
              <div class="insights-list">
                @for (insight of getInsights(); track insight) {
                  <div class="insight-item">
                    <span class="insight-icon">{{ getInsightIcon(insight) }}</span>
                    <p>{{ insight }}</p>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>No trend data available. Start marking attendance to see your trends!</p>
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

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding: 1.5rem;

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          font-weight: 600;
          color: #2d3748;
          font-size: 0.875rem;
        }
      }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .trends-summary {
      margin-bottom: 2rem;
      padding: 2rem;

      h2 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.25rem;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(124, 156, 191, 0.05);
          border-radius: 8px;

          .label {
            font-size: 0.75rem;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }

          .value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #7c9cbf;

            &.trending-up {
              color: #7bc043;
            }

            &.trending-down {
              color: #ee4266;
            }

            &.stable {
              color: #ffa62b;
            }
          }
        }
      }
    }

    .insights {
      padding: 2rem;

      h2 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.25rem;
      }

      .insights-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .insight-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(124, 156, 191, 0.05);
          border-left: 4px solid #7c9cbf;
          border-radius: 4px;

          .insight-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
          }

          p {
            margin: 0;
            color: #2d3748;
            font-size: 0.875rem;
            line-height: 1.5;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TrendsComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  allSubjects = signal<any[]>([]);
  chartData = signal({ labels: [] as string[], datasets: [] as any[] });
  selectedSubject = '';
  timePeriod = 'month';

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/student/dashboard', icon: '🏠' },
    { label: 'Mark Attendance', route: '/student/mark-attendance', icon: '✓' },
    { label: 'My Attendance', route: '/student/my-attendance', icon: '📋' },
    { label: 'Reports', route: '/student/reports', icon: '📊' },
    { label: 'Trends', route: '/student/trends', icon: '📈' }
  ];

  ngOnInit() {
    this.loadTrendData();
  }

  private loadTrendData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.attendanceService.getAllAttendanceReports(currentUser.userId).subscribe({
        next: (reports) => {
          this.allSubjects.set(reports);
          this.generateChartData(reports);
        },
        error: (error) => console.error('Failed to load attendance data:', error)
      });
    }
  }

  private generateChartData(reports: any[]) {
    // Mock data generation - replace with actual data transformation
    const labels = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const data = Array.from({ length: 30 }, () => Math.round(Math.random() * 100));

    this.chartData.set({
      labels,
      datasets: [
        {
          label: 'Attendance %',
          data,
          borderColor: '#7c9cbf',
          backgroundColor: 'rgba(124, 156, 191, 0.1)',
          tension: 0.4
        }
      ]
    });
  }

  linChartData() {
    return this.chartData().datasets;
  }

  weeklyData() {
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [
        {
          label: 'Classes Attended',
          data: [5, 4, 5, 3, 4],
          backgroundColor: 'rgba(124, 156, 191, 0.6)'
        }
      ]
    };
  }

  getCurrentTrend(): string {
    return '📈 Improving';
  }

  getTrendClass(): string {
    return 'trending-up';
  }

  getAverageAttendance(): number {
    return 78.5;
  }

  getHighestAttendance(): number {
    return 95;
  }

  getLowestAttendance(): number {
    return 40;
  }

  getInsights(): string[] {
    return [
      'Your attendance has been consistently improving over the past month',
      'You have a 78.5% overall attendance rate, which is above the minimum threshold',
      'Mathematics has the lowest attendance at 65% - consider focusing on this subject',
      'Your attendance improves significantly on Wednesdays and Thursdays'
    ];
  }

  getInsightIcon(insight: string): string {
    if (insight.includes('improving')) return '📈';
    if (insight.includes('above')) return '✓';
    if (insight.includes('lowest')) return '⚠️';
    if (insight.includes('improves')) return '💡';
    return '📌';
  }

  onSubjectChange(event: any) {
    this.selectedSubject = event.target.value;
    this.loadTrendData();
  }

  onPeriodChange(event: any) {
    this.timePeriod = event.target.value;
    this.loadTrendData();
  }
}
