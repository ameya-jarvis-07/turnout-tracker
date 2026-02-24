import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AttendanceChartComponent } from '../../shared/components/attendance-chart/attendance-chart.component';
import { AttendanceService } from '../../shared/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-subject-report',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent, AttendanceChartComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        
        <main class="main-content">
          <!-- Header -->
          <div class="page-header">
            <div class="header-left">
              <button class="back-button clay-button" routerLink="/student/reports">
                ← Back
              </button>
              <div class="subject-info">
                @if (subject()) {
                  <h1>{{ subject()!.name }}</h1>
                  <p class="subject-code">{{ subject()!.code }} • {{ subject()!.faculty }}</p>
                } @else {
                  <h1>Loading...</h1>
                }
              </div>
            </div>
            <div class="header-actions">
              <select class="clay-select" [(ngModel)]="selectedMonth" (change)="onMonthChange()">
                @for (month of months; track month.value) {
                  <option [value]="month.value">{{ month.label }}</option>
                }
              </select>
              <button class="clay-button" (click)="downloadReport()">
                📥 Download Report
              </button>
            </div>
          </div>

          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading report data...</p>
            </div>
          } @else {
            <!-- Statistics Cards -->
            <div class="stats-grid">
              <div class="stat-card clay-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                  <p class="stat-label">Attendance Rate</p>
                  <p class="stat-value" [class.high]="attendanceRate() >= 75" 
                     [class.medium]="attendanceRate() >= 60 && attendanceRate() < 75"
                     [class.low]="attendanceRate() < 60">
                    {{ attendanceRate() }}%
                  </p>
                </div>
              </div>

              <div class="stat-card clay-card">
                <div class="stat-icon">✓</div>
                <div class="stat-content">
                  <p class="stat-label">Classes Attended</p>
                  <p class="stat-value">{{ classesAttended() }}/{{ totalClasses() }}</p>
                </div>
              </div>

              <div class="stat-card clay-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                  <p class="stat-label">Required Attendance</p>
                  <p class="stat-value">75%</p>
                </div>
              </div>

              <div class="stat-card clay-card">
                <div class="stat-icon" [class.text-green]="classesNeeded() <= 0" 
                     [class.text-red]="classesNeeded() > 0">
                  {{ classesNeeded() <= 0 ? '🏆' : '⚠️' }}
                </div>
                <div class="stat-content">
                  <p class="stat-label">Classes to Target</p>
                  <p class="stat-value" [class.text-green]="classesNeeded() <= 0" 
                     [class.text-red]="classesNeeded() > 0">
                    {{ classesNeeded() <= 0 ? 'Target Met!' : classesNeeded() + ' more' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Monthly Calendar View -->
            <div class="clay-card calendar-card">
              <h2>📅 Monthly Attendance Calendar</h2>
              <div class="calendar-grid">
                <div class="calendar-header">
                  @for (day of weekDays; track day) {
                    <div class="calendar-day-name">{{ day }}</div>
                  }
                </div>
                <div class="calendar-body">
                  @for (day of calendarDays(); track day.date) {
                    <div class="calendar-day" 
                         [class.other-month]="!day.isCurrentMonth"
                         [class.present]="day.status === 'present'"
                         [class.absent]="day.status === 'absent'"
                         [class.no-class]="!day.hasClass"
                         [class.today]="day.isToday">
                      <span class="day-number">{{ day.dayNumber }}</span>
                      @if (day.hasClass) {
                        <span class="day-status">
                          {{ day.status === 'present' ? '✓' : day.status === 'absent' ? '✗' : '' }}
                        </span>
                      }
                    </div>
                  }
                </div>
              </div>
              <div class="calendar-legend">
                <div class="legend-item">
                  <span class="legend-dot present"></span>
                  <span>Present</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot absent"></span>
                  <span>Absent</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot no-class"></span>
                  <span>No Class</span>
                </div>
              </div>
            </div>

            <!-- Attendance Chart -->
            <div class="clay-card">
              <h2>📈 Attendance Trend</h2>
              <app-attendance-chart 
                [chartType]="'line'"
                [labels]="chartData().labels"
                [datasets]="chartData().datasets">
              </app-attendance-chart>
            </div>

            <!-- Session History -->
            <div class="clay-card session-history">
              <div class="card-header">
                <h2>📋 Session History</h2>
                <div class="filter-buttons">
                  <button class="filter-btn" 
                          [class.active]="sessionFilter() === 'all'"
                          (click)="sessionFilter.set('all')">
                    All ({{ sessions().length }})
                  </button>
                  <button class="filter-btn" 
                          [class.active]="sessionFilter() === 'present'"
                          (click)="sessionFilter.set('present')">
                    Present ({{ classesAttended() }})
                  </button>
                  <button class="filter-btn" 
                          [class.active]="sessionFilter() === 'absent'"
                          (click)="sessionFilter.set('absent')">
                    Absent ({{ totalClasses() - classesAttended() }})
                  </button>
                </div>
              </div>

              <div class="sessions-list">
                @for (session of filteredSessions(); track session.id) {
                  <div class="session-item" [class.present]="session.isPresent" [class.absent]="!session.isPresent">
                    <div class="session-icon">
                      {{ session.isPresent ? '✓' : '✗' }}
                    </div>
                    <div class="session-details">
                      <div class="session-date">
                        <strong>{{ formatDate(session.date) }}</strong>
                        <span class="session-time">{{ formatTime(session.startTime) }} - {{ formatTime(session.endTime) }}</span>
                      </div>
                      <div class="session-info">
                        <span class="session-topic">{{ session.topic }}</span>
                        @if (session.isPresent) {
                          <span class="mark-time">Marked at {{ formatTime(session.markedAt!) }}</span>
                        } @else {
                          <span class="absent-reason">{{ session.reason || 'Not marked' }}</span>
                        }
                      </div>
                    </div>
                    <div class="session-status">
                      <span class="status-badge" [class.present]="session.isPresent" [class.absent]="!session.isPresent">
                        {{ session.isPresent ? 'Present' : 'Absent' }}
                      </span>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <p>No sessions found for the selected filter.</p>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;

      .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .back-button {
        padding: 0.5rem 1rem;
      }

      .subject-info {
        flex: 1;

        h1 {
          margin: 0;
          color: #2d3748;
          font-size: 1.75rem;
        }

        .subject-code {
          margin: 0.25rem 0 0 0;
          color: #718096;
          font-size: 0.9rem;
        }
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top-color: var(--primary-color, #667eea);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      p {
        color: #718096;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;

      .stat-icon {
        font-size: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));

        &.text-green {
          color: #48bb78;
        }

        &.text-red {
          color: #f56565;
        }
      }

      .stat-content {
        flex: 1;

        .stat-label {
          margin: 0 0 0.5rem 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .stat-value {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 600;
          color: #2d3748;

          &.high {
            color: #48bb78;
          }

          &.medium {
            color: #ed8936;
          }

          &.low {
            color: #f56565;
          }

          &.text-green {
            color: #48bb78;
          }

          &.text-red {
            color: #f56565;
          }
        }
      }
    }

    .calendar-card {
      padding: 1.5rem;
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.25rem;
      }
    }

    .calendar-grid {
      margin-bottom: 1rem;
    }

    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      .calendar-day-name {
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
        color: #4a5568;
        padding: 0.5rem;
      }
    }

    .calendar-body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;

      .calendar-day {
        aspect-ratio: 1;
        border-radius: 8px;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        background: #f7fafc;
        border: 2px solid transparent;
        transition: all 0.2s;

        .day-number {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a5568;
        }

        .day-status {
          font-size: 1rem;
        }

        &.other-month {
          opacity: 0.3;
        }

        &.today {
          border-color: var(--primary-color, #667eea);
          font-weight: 600;
        }

        &.present {
          background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
          
          .day-status {
            color: #22543d;
          }
        }

        &.absent {
          background: linear-gradient(135deg, #fed7d7, #fc8181);
          
          .day-status {
            color: #742a2a;
          }
        }

        &.no-class {
          background: #f7fafc;
        }

        &:hover:not(.other-month) {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .calendar-legend {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #4a5568;

        .legend-dot {
          width: 16px;
          height: 16px;
          border-radius: 4px;

          &.present {
            background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
          }

          &.absent {
            background: linear-gradient(135deg, #fed7d7, #fc8181);
          }

          &.no-class {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
          }
        }
      }
    }

    .session-history {
      padding: 1.5rem;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;

        h2 {
          margin: 0;
          color: #2d3748;
          font-size: 1.25rem;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          background: #f7fafc;
          padding: 0.25rem;
          border-radius: 8px;

          .filter-btn {
            padding: 0.5rem 1rem;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-size: 0.875rem;
            color: #4a5568;
            cursor: pointer;
            transition: all 0.2s;

            &.active {
              background: white;
              color: var(--primary-color, #667eea);
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            &:hover:not(.active) {
              background: rgba(255, 255, 255, 0.5);
            }
          }
        }
      }

      .sessions-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .session-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          background: #f7fafc;
          transition: all 0.2s;

          &.present {
            border-left: 4px solid #48bb78;
          }

         &.absent {
            border-left: 4px solid #f56565;
          }

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .session-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 1.25rem;
            background: white;
          }

          &.present .session-icon {
            background: #c6f6d5;
            color: #22543d;
          }

          &.absent .session-icon {
            background: #fed7d7;
            color: #742a2a;
          }

          .session-details {
            flex: 1;

            .session-date {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              margin-bottom: 0.25rem;

              strong {
                color: #2d3748;
              }

              .session-time {
                font-size: 0.875rem;
                color: #718096;
              }
            }

            .session-info {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              font-size: 0.875rem;

              .session-topic {
                color: #4a5568;
              }

              .mark-time {
                color: #48bb78;
              }

              .absent-reason {
                color: #f56565;
              }
            }
          }

          .session-status {
            .status-badge {
              padding: 0.25rem 0.75rem;
              border-radius: 12px;
              font-size: 0.875rem;
              font-weight: 500;

              &.present {
                background: #c6f6d5;
                color: #22543d;
              }

              &.absent {
                background: #fed7d7;
                color: #742a2a;
              }
            }
          }
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #718096;
        }
      }
    }

    @media (max-width: 768px) {
      .dashboard-content {
        flex-direction: column;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;

        .header-actions {
          width: 100%;

          select, button {
            flex: 1;
          }
        }
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .calendar-body .calendar-day {
        padding: 0.25rem;

        .day-number {
          font-size: 0.75rem;
        }

        .day-status {
          font-size: 0.75rem;
        }
      }

      .session-item {
        flex-direction: column;
        align-items: flex-start !important;
      }
    }
  `]
})
export class SubjectReportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  subjectId: string | null = null;

  // Signals
  loading = signal(true);
  subject = signal<any>(null);
  sessions = signal<AttendanceSession[]>([]);
  sessionFilter = signal<'all' | 'present' | 'absent'>('all');
  selectedMonth = new Date().getMonth();
  
  // Computed values
  classesAttended = computed(() => {
    return this.sessions().filter(s => s.isPresent).length;
  });

  totalClasses = computed(() => {
    return this.sessions().length;
  });

  attendanceRate = computed(() => {
    const total = this.totalClasses();
    if (total === 0) return 0;
    return Math.round((this.classesAttended() / total) * 100);
  });

  classesNeeded = computed(() => {
    const rate = this.attendanceRate();
    const total = this.totalClasses();
    const attended = this.classesAttended();
    
    if (rate >= 75) return 0;
    
    // Calculate classes needed to reach 75%
    // (attended + x) / (total + x) = 0.75
    // attended + x = 0.75 * (total + x)
    // attended + x = 0.75 * total + 0.75 * x
    // x - 0.75 * x = 0.75 * total - attended
    // 0.25 * x = 0.75 * total - attended
    // x = (0.75 * total - attended) / 0.25
    const needed = Math.ceil((0.75 * total - attended) / 0.25);
    return Math.max(0, needed);
  });

  filteredSessions = computed(() => {
    const filter = this.sessionFilter();
    if (filter === 'all') return this.sessions();
    if (filter === 'present') return this.sessions().filter(s => s.isPresent);
    return this.sessions().filter(s => !s.isPresent);
  });

  calendarDays = computed(() => {
    return this.generateCalendarDays();
  });

  chartData = computed(() => {
    return this.generateChartData();
  });

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/student/dashboard', icon: '🏠' },
    { label: 'Mark Attendance', route: '/student/mark-attendance', icon: '✓' },
    { label: 'My Attendance', route: '/student/my-attendance', icon: '📋' },
    { label: 'Reports', route: '/student/reports', icon: '📊' },
    { label: 'Trends', route: '/student/trends', icon: '📈' }
  ];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];

  ngOnInit() {
    this.subjectId = this.route.snapshot.paramMap.get('id');
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    
    try {
      // Load subject details and attendance sessions
      // In production, these would be API calls
      await this.loadSubjectDetails();
      await this.loadAttendanceSessions();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadSubjectDetails() {
    // Mock subject data - replace with actual API call
    setTimeout(() => {
      this.subject.set({
        id: this.subjectId,
        name: 'Data Structures and Algorithms',
        code: 'CS301',
        faculty: 'Dr. Sarah Johnson',
        credits: 4,
        semester: 'Fall 2024'
      });
    }, 500);
  }

  async loadAttendanceSessions() {
    // Generate mock attendance data - replace with actual API call
    setTimeout(() => {
      const sessions = this.generateMockSessions();
      this.sessions.set(sessions);
    }, 700);
  }

  generateMockSessions(): AttendanceSession[] {
    const sessions: AttendanceSession[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);
    
    const topics = [
      'Introduction to Data Structures',
      'Arrays and Linked Lists',
      'Stacks and Queues',
      'Trees and Binary Search Trees',
      'Graph Algorithms',
      'Sorting Algorithms',
      'Hash Tables',
      'Dynamic Programming',
      'Greedy Algorithms',
      'Recursion and Backtracking'
    ];

    for (let i = 0; i < 30; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + (i * 2)); // Every 2 days
      
      // Skip weekends
      if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) {
        continue;
      }

      const isPresent = Math.random() > 0.25; // 75% attendance randomly
      const session: AttendanceSession = {
        id: `session-${i}`,
        date: sessionDate.toISOString(),
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        topic: topics[i % topics.length],
        isPresent: isPresent,
        markedAt: isPresent ? `${Math.floor(10 + Math.random() * 1.5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} AM` : null,
        reason: !isPresent ? (Math.random() > 0.5 ? 'Not marked' : 'Medical leave') : null
      };

      sessions.push(session);
    }

    return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  generateCalendarDays(): CalendarDay[] {
    const year = new Date().getFullYear();
    const month = this.selectedMonth;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevLastDate - i);
      days.push({
        date: dayDate.toISOString(),
        dayNumber: prevLastDate - i,
        isCurrentMonth: false,
        isToday: false,
        hasClass: false,
        status: null
      });
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
      const dayDate = new Date(year, month, i);
      dayDate.setHours(0, 0, 0, 0);
      const isToday = dayDate.getTime() === today.getTime();
      
      // Check if there's a session on this day
      const session = this.sessions().find(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === dayDate.getTime();
      });

      days.push({
        date: dayDate.toISOString(),
        dayNumber: i,
        isCurrentMonth: true,
        isToday: isToday,
        hasClass: !!session,
        status: session ? (session.isPresent ? 'present' : 'absent') : null
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(year, month + 1, i);
      days.push({
        date: dayDate.toISOString(),
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        hasClass: false,
        status: null
      });
    }

    return days;
  }

  generateChartData() {
    // Generate cumulative attendance rate over time
    const sessions = [...this.sessions()].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let attended = 0;
    let total = 0;

    const labels: string[] = [];
    const dataPoints: number[] = [];

    sessions.forEach(session => {
      total++;
      if (session.isPresent) attended++;
      
      labels.push(this.formatDateShort(session.date));
      dataPoints.push(Math.round((attended / total) * 100));
    });

    return {
      labels,
      datasets: [{
        label: 'Attendance Rate',
        data: dataPoints,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }, {
        label: 'Target (75%)',
        data: Array(labels.length).fill(75),
        borderColor: '#48bb78',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      }]
    };
  }

  onMonthChange() {
    // Reload data for selected month if needed
    console.log('Month changed to:', this.months[this.selectedMonth].label);
  }

  downloadReport() {
    // Generate and download PDF report
    const subject = this.subject();
    if (!subject) return;

    const reportData = {
      subject: subject.name,
      code: subject.code,
      faculty: subject.faculty,
      attendanceRate: this.attendanceRate(),
      classesAttended: this.classesAttended(),
      totalClasses: this.totalClasses(),
      classesNeeded: this.classesNeeded(),
      sessions: this.sessions()
    };

    console.log('Downloading report:', reportData);
    alert('Report download feature: Connect to backend PDF generation service');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  formatTime(time: string): string {
    return time;
  }
}

interface AttendanceSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  isPresent: boolean;
  markedAt: string | null;
  reason: string | null;
}

interface CalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasClass: boolean;
  status: 'present' | 'absent' | null;
}
