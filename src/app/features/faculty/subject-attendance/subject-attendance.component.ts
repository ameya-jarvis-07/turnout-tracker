import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AttendanceChartComponent } from '../../shared/components/attendance-chart/attendance-chart.component';
import { AttendanceService } from '../../shared/services/attendance.service';
import { SubjectService } from '../../shared/services/subject.service';

@Component({
  selector: 'app-subject-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent, AttendanceChartComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        
        <main class="main-content">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading subject details...</p>
            </div>
          } @else {
            <!-- Header -->
            <div class="page-header">
              <div class="header-content">
                <button class="back-button clay-button" routerLink="/faculty/my-subjects">
                  ← Back
                </button>
                <div class="subject-info">
                  @if (subject()) {
                    <h1>{{ subject()!.name }}</h1>
                    <p class="subject-meta">
                      {{ subject()!.code }} • {{ subject()!.credits }} Credits • Semester {{ subject()!.semester }}
                    </p>
                  }
                </div>
              </div>
              <button class="clay-button" routerLink="/faculty/open-session" [queryParams]="{ subjectId: subjectId }">
                🚀 Open New Session
              </button>
            </div>

            <!-- Statistics Cards -->
            <div class="stats-grid">
              <div class="stat-card clay-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <p class="stat-label">Total Students</p>
                  <p class="stat-value">{{ totalStudents() }}</p>
                </div>
              </div>

              <div class="stat-card clay-card">
                <div class="stat-icon">📅</div>
                <div class="stat-content">
                  <p class="stat-label">Total Sessions</p>
                  <p class="stat-value">{{ totalSessions() }}</p>
                </div>
              </div>

              <div class="stat-card clay-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                  <p class="stat-label">Average Attendance</p>
                  <p class="stat-value" [class.high]="averageAttendance() >= 75" 
                     [class.medium]="averageAttendance() >= 60 && averageAttendance() < 75"
                     [class.low]="averageAttendance() < 60">
                    {{ averageAttendance() }}%
                  </p>
                </div>
              </div>

              <div class="stat-card clay-card">
                <div class="stat-icon" [class.text-red]="lowAttendanceCount() > 0">
                  {{ lowAttendanceCount() > 0 ? '⚠️' : '✅' }}
                </div>
                <div class="stat-content">
                  <p class="stat-label">Low Attendance</p>
                  <p class="stat-value" [class.text-red]="lowAttendanceCount() > 0">
                    {{ lowAttendanceCount() }} Students
                  </p>
                </div>
              </div>
            </div>

            <!-- Attendance Trend Chart -->
            <div class="clay-card chart-card">
              <h2>📈 Attendance Trend</h2>
              <app-attendance-chart 
                [chartType]="'line'"
                [labels]="chartData().labels"
                [datasets]="chartData().datasets">
              </app-attendance-chart>
            </div>

            <!-- Student Attendance Table -->
            <div class="clay-card table-card">
              <div class="table-header">
                <h2>👥 Student Attendance Records</h2>
                <div class="table-actions">
                  <input 
                    type="text" 
                    class="clay-input search-input"
                    placeholder="Search students..."
                    [(ngModel)]="searchQuery"
                    (input)="onSearchChange()">
                  <button class="clay-button secondary" (click)="exportData()">
                    📥 Export CSV
                  </button>
                </div>
              </div>

              <div class="table-container">
                <table class="attendance-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th class="center">Classes Attended</th>
                      <th class="center">Total Sessions</th>
                      <th class="center">Attendance %</th>
                      <th class="center">Status</th>
                      <th class="center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (student of filteredStudents(); track student.id) {
                      <tr>
                        <td>
                          <div class="student-info">
                            <div class="student-avatar">{{ getInitials(student.name) }}</div>
                            <span class="student-name">{{ student.name }}</span>
                          </div>
                        </td>
                        <td>{{ student.email }}</td>
                        <td class="center">{{ student.classesAttended }}</td>
                        <td class="center">{{ student.totalSessions }}</td>
                        <td class="center">
                          <span class="attendance-badge" 
                                [class.high]="student.attendanceRate >= 75"
                                [class.medium]="student.attendanceRate >= 60 && student.attendanceRate < 75"
                                [class.low]="student.attendanceRate < 60">
                            {{ student.attendanceRate }}%
                          </span>
                        </td>
                        <td class="center">
                          <span class="status-badge"
                                [class.good]="student.attendanceRate >= 75"
                                [class.warning]="student.attendanceRate >= 60 && student.attendanceRate < 75"
                                [class.critical]="student.attendanceRate < 60">
                            {{ student.attendanceRate >= 75 ? 'Good' : student.attendanceRate >= 60 ? 'Warning' : 'Critical' }}
                          </span>
                        </td>
                        <td class="center">
                          <button class="action-button" (click)="viewStudentDetails(student.id)" title="View Details">
                            👁️
                          </button>
                          <button class="action-button" (click)="contactStudent(student.email)" title="Send Email">
                            📧
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="7" class="empty-state">
                          No students found matching your search.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="table-footer">
                <p>Showing {{ filteredStudents().length }} of {{ studentAttendance().length }} students</p>
              </div>
            </div>

            <!-- Recent Sessions -->
            <div class="clay-card sessions-card">
              <h2>📜 Recent Sessions</h2>
              <div class="sessions-list">
                @for (session of recentSessions(); track session.id) {
                  <div class="session-item">
                    <div class="session-icon">📅</div>
                    <div class="session-details">
                      <div class="session-header">
                        <strong>{{ formatDate(session.date) }}</strong>
                        <span class="session-time">{{ session.startTime }} - {{ session.endTime }}</span>
                      </div>
                      <p class="session-topic">{{ session.topic }}</p>
                      <div class="session-stats">
                        <span class="stat-item">
                          👥 {{ session.attendedCount }}/{{ totalStudents() }} students
                        </span>
                        <span class="stat-item" [class.high]="session.attendanceRate >= 75">
                          📊 {{ session.attendanceRate }}% attendance
                        </span>
                      </div>
                    </div>
                    <button class="action-button" routerLink="/faculty/active-session" [queryParams]="{ id: session.id }">
                      View
                    </button>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <p>No sessions conducted yet for this subject.</p>
                    <button class="clay-button" routerLink="/faculty/open-session" [queryParams]="{ subjectId: subjectId }">
                      Open First Session
                    </button>
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;

      .header-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;

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

          .subject-meta {
            margin: 0.25rem 0 0 0;
            color: #718096;
            font-size: 0.9rem;
          }
        }
      }
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

          &.text-red {
            color: #f56565;
          }
        }
      }
    }

    .chart-card {
      padding: 1.5rem;
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.25rem;
      }
    }

    .table-card {
      padding: 1.5rem;
      margin-bottom: 2rem;

      .table-header {
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

        .table-actions {
          display: flex;
          gap: 1rem;
          align-items: center;

          .search-input {
            min-width: 200px;
          }
        }
      }

      .table-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }

      .attendance-table {
        width: 100%;
        border-collapse: collapse;

        thead {
          background: #f7fafc;
        }

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #4a5568;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e2e8f0;

          &.center {
            text-align: center;
          }
        }

        tbody tr {
          border-bottom: 1px solid #e2e8f0;
          transition: background-color 0.2s;

          &:hover {
            background: #f7fafc;
          }
        }

        td {
          padding: 1rem;
          color: #2d3748;
          font-size: 0.875rem;

          &.center {
            text-align: center;
          }

          &.empty-state {
            text-align: center;
            padding: 3rem;
            color: #718096;
          }
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .student-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 600;
          }

          .student-name {
            font-weight: 500;
          }
        }

        .attendance-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          display: inline-block;

          &.high {
            background: #c6f6d5;
            color: #22543d;
          }

          &.medium {
            background: #feebc8;
            color: #7c2d12;
          }

          &.low {
            background: #fed7d7;
            color: #742a2a;
          }
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: inline-block;

          &.good {
            background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
            color: #22543d;
          }

          &.warning {
            background: linear-gradient(135deg, #feebc8, #fbd38d);
            color: #7c2d12;
          }

          &.critical {
            background: linear-gradient(135deg, #fed7d7, #fc8181);
            color: #742a2a;
          }
        }

        .action-button {
          background: none;
          border: none;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          font-size: 1.125rem;
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.2);
          }
        }
      }

      .table-footer {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
        color: #718096;
        font-size: 0.875rem;
      }
    }

    .sessions-card {
      padding: 1.5rem;

      h2 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.25rem;
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

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .session-icon {
            font-size: 2rem;
            flex-shrink: 0;
          }

          .session-details {
            flex: 1;

            .session-header {
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

            .session-topic {
              margin: 0.25rem 0;
              color: #4a5568;
              font-size: 0.875rem;
            }

            .session-stats {
              display: flex;
              gap: 1rem;
              margin-top: 0.5rem;

              .stat-item {
                font-size: 0.875rem;
                color: #718096;

                &.high {
                  color: #48bb78;
                  font-weight: 600;
                }
              }
            }
          }

          .action-button {
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #f7fafc;
              border-color: #cbd5e0;
            }
          }
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;

          p {
            margin-bottom: 1rem;
            color: #718096;
          }
        }
      }
    }

    @media (max-width:768px) {
      .dashboard-content {
        flex-direction: column;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .table-header {
        flex-direction: column;
        align-items: flex-start !important;

        .table-actions {
          width: 100%;

          input, button {
            flex: 1;
          }
        }
      }

      .session-item {
        flex-direction: column;
        align-items: flex-start !important;
      }
    }
  `]
})
export class SubjectAttendanceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private subjectService = inject(SubjectService);
  private attendanceService = inject(AttendanceService);

  subjectId: string | null = null;
  searchQuery = '';

  // Signals
  loading = signal(true);
  subject = signal<any>(null);
  studentAttendance = signal<StudentAttendance[]>([]);
  recentSessions = signal<Session[]>([]);

  // Computed values
  totalStudents = computed(() => this.studentAttendance().length);
  
  totalSessions = computed(() => {
    const students = this.studentAttendance();
    return students.length > 0 ? students[0].totalSessions : 0;
  });

  averageAttendance = computed(() => {
    const students = this.studentAttendance();
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, s) => acc + s.attendanceRate, 0);
    return Math.round(sum / students.length);
  });

  lowAttendanceCount = computed(() => {
    return this.studentAttendance().filter(s => s.attendanceRate < 75).length;
  });

  filteredStudents = computed(() => {
    const query = this.searchQuery.toLowerCase();
    if (!query) return this.studentAttendance();
    return this.studentAttendance().filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query)
    );
  });

  chartData = computed(() => {
    return this.generateChartData();
  });

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/faculty/dashboard', icon: '🏠' },
    { label: 'My Subjects', route: '/faculty/my-subjects', icon: '📚' },
    { label: 'Open Session', route: '/faculty/open-session', icon: '🚀' },
    { label: 'Session History', route: '/faculty/session-history', icon: '📜' },
    { label: 'Reports', route: '/faculty/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.subjectId = this.route.snapshot.paramMap.get('id');
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    
    try {
      await Promise.all([
        this.loadSubjectDetails(),
        this.loadStudentAttendance(),
        this.loadRecentSessions()
      ]);
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
        credits: 4,
        semester: 5
      });
    }, 500);
  }

  async loadStudentAttendance() {
    // Generate mock student attendance data
    setTimeout(() => {
      const students = this.generateMockStudentAttendance();
      this.studentAttendance.set(students);
    }, 700);
  }

  async loadRecentSessions() {
    // Generate mock recent sessions data
    setTimeout(() => {
      const sessions = this.generateMockRecentSessions();
      this.recentSessions.set(sessions);
    }, 600);
  }

  generateMockStudentAttendance(): StudentAttendance[] {
    const totalSessions = 24;
    const students: StudentAttendance[] = [];

    const names = [
      'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince',
      'Ethan Hunt', 'Fiona Green', 'George Miller', 'Hannah Lee',
      'Ian Malcolm', 'Jane Foster', 'Kevin Hart', 'Laura Palmer',
      'Michael Scott', 'Nina Myers', 'Oscar Wilde', 'Pam Beesly',
      'Quinn Fabray', 'Rachel Green', 'Steve Rogers', 'Tony Stark',
      'Uma Thurman', 'Victor Hugo', 'Wendy Darling', 'Xavier Woods'
    ];

    names.forEach((name, index) => {
      const attended = Math.floor(Math.random() * (totalSessions - 12)) + 12; // 12-24 attended
      const rate = Math.round((attended / totalSessions) * 100);

      students.push({
        id: `student-${index + 1}`,
        name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@university.edu`,
        classesAttended: attended,
        totalSessions: totalSessions,
        attendanceRate: rate
      });
    });

    // Sort by attendance rate descending
    return students.sort((a, b) => b.attendanceRate - a.attendanceRate);
  }

  generateMockRecentSessions(): Session[] {
    const sessions: Session[] = [];
    const topics = [
      'Introduction to Linked Lists',
      'Stack and Queue Implementation',
      'Binary Search Trees',
      'Graph Traversal Algorithms',
      'Dynamic Programming Basics'
    ];

    const totalStudents = 24;

    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 2));
      const attended = Math.floor(Math.random() * 6) + 18; // 18-24 attended
      const rate = Math.round((attended / totalStudents) * 100);

      sessions.push({
        id: `session-${i + 1}`,
        date: date.toISOString(),
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        topic: topics[i],
        attendedCount: attended,
        attendanceRate: rate
      });
    }

    return sessions;
  }

  generateChartData() {
    const sessions = [...this.recentSessions()].reverse(); // Oldest to newest
    
    return {
      labels: sessions.map(s => this.formatDateShort(s.date)),
      datasets: [{
        label: 'Attendance Rate',
        data: sessions.map(s => s.attendanceRate),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }, {
        label: 'Target (75%)',
        data: Array(sessions.length).fill(75),
        borderColor: '#48bb78',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      }]
    };
  }

  onSearchChange() {
    // Filter is handled by computed signal
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
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

  exportData() {
    const data = this.studentAttendance();
    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.subject()?.code || 'subject'}-attendance.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(data: StudentAttendance[]): string {
    const headers = ['Name', 'Email', 'Classes Attended', 'Total Sessions', 'Attendance %', 'Status'];
    const rows = data.map(s => [
      s.name,
      s.email,
      s.classesAttended,
      s.totalSessions,
      s.attendanceRate,
      s.attendanceRate >= 75 ? 'Good' : s.attendanceRate >= 60 ? 'Warning' : 'Critical'
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  viewStudentDetails(studentId: string) {
    console.log('View student details:', studentId);
    alert('Student detail view: Connect to student attendance report page');
  }

  contactStudent(email: string) {
    window.location.href = `mailto:${email}?subject=Regarding Your Attendance`;
  }
}

interface StudentAttendance {
  id: string;
  name: string;
  email: string;
  classesAttended: number;
  totalSessions: number;
  attendanceRate: number;
}

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  attendedCount: number;
  attendanceRate: number;
}
