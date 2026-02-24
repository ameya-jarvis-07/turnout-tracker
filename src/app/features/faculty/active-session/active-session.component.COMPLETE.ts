import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AttendanceSessionService } from '../../shared/services/attendance-session.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        
        <main class="main-content">
          <div class="page-header">
            <div>
              <h1>Active Session Monitor</h1>
              <p>Real-time session tracking and student attendance</p>
            </div>
            <div class="header-actions">
              <button class="clay-button icon-button" (click)="refreshSession()" [disabled]="loading()">
                🔄 Refresh
              </button>
              <button class="clay-button danger" (click)="closeSessionConfirm()">
                Close Session
              </button>
            </div>
          </div>

          @if (session(); as sessionData) {
            <div class="session-info clay-card">
              <div class="info-header">
                <div>
                  <h2>{{ sessionData.subjectName }}</h2>
                  <p class="subject-code">{{ sessionData.subjectCode }}</p>
                </div>
                <span class="status-badge active">⚡ LIVE</span>
              </div>
              <div class="session-stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Started At</span>
                  <span class="stat-value">{{ formatTime(sessionData.startTime) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Duration</span>
                  <span class="stat-value">{{ calculateDuration(sessionData.startTime) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Students Marked</span>
                  <span class="stat-value highlight">{{ sessionData.totalStudentsMarked }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Students</span>
                  <span class="stat-value">{{ sessionData.totalStudents || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Attendance Rate</span>
                  <span class="stat-value">{{ calculateAttendanceRate(sessionData) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Last Updated</span>
                  <span class="stat-value">{{ formatTimeAgo(lastUpdate()) }}</span>
                </div>
              </div>
            </div>

            <div class="dashboard-row">
              <div class="students-list clay-card">
                <h3>📋 Students Who Marked Attendance</h3>
                @if (attendedStudents().length > 0) {
                  <div class="student-items">
                    @for (student of attendedStudents(); track student.userId) {
                      <div class="student-item">
                        <div class="student-avatar">{{ getInitials(student.userName) }}</div>
                        <div class="student-info">
                          <strong>{{ student.userName }}</strong>
                          <small>{{ student.userEmail }}</small>
                        </div>
                        <span class="timestamp">{{ formatTime(student.markedAt) }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="empty-state">
                    <span class="empty-icon">⏳</span>
                    <p>Waiting for students to mark attendance...</p>
                  </div>
                }
              </div>

              <div class="session-controls clay-card">
                <h3>🎛️ Session Controls</h3>
                <div class="control-buttons">
                  <button class="clay-button full-width" (click)="downloadAttendance()">
                    📥 Download Attendance
                  </button>
                  <button class="clay-button full-width secondary" (click)="shareSession()">
                    📤 Share Session Link
                  </button>
                  <button class="clay-button full-width secondary" (click)="notifyStudents()">
                    📢 Notify Students
                  </button>
                </div>
                
                <div class="qr-section">
                  <h4>QR Code</h4>
                  <div class="qr-placeholder">
                    <p>📱</p>
                    <small>QR Code would display here</small>
                  </div>
                </div>
              </div>
            </div>
          } @else if (loading()) {
            <div class="loading-state clay-card">
              <p>Loading session data...</p>
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>Session not found or has been closed</p>
              <button class="clay-button" routerLink="/faculty/dashboard">
                Back to Dashboard
              </button>
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
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;

      h1 {
        margin: 0 0 0.25rem 0;
        color: #2d3748;
        font-size: 2rem;
      }

      p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .icon-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .session-info {
      margin-bottom: 2rem;

      .info-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(163, 177, 198, 0.2);

        h2 {
          margin: 0 0 0.25rem 0;
          color: #2d3748;
        }

        .subject-code {
          margin: 0;
          color: #718096;
          font-family: monospace;
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.875rem;
          animation: pulse 2s infinite;

          &.active {
            background: rgba(123, 192, 67, 0.2);
            color: #7bc043;
          }
        }
      }

      .session-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .stat-label {
          font-size: 0.875rem;
          color: #718096;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;

          &.highlight {
            color: #7bc043;
          }
        }
      }
    }

    .dashboard-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .students-list {
      h3 {
        margin: 0 0 1.5rem 0;
        font-size: 1.125rem;
        color: #2d3748;
      }

      .student-items {
        max-height: 500px;
        overflow-y: auto;
      }

      .student-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid rgba(163, 177, 198, 0.2);
        transition: background 0.2s ease;

        &:hover {
          background: rgba(124, 156, 191, 0.05);
        }

        &:last-child {
          border-bottom: none;
        }

        .student-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c9cbf, #8b9dc3);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .student-info {
          flex: 1;
          min-width: 0;

          strong {
            display: block;
            color: #2d3748;
            margin-bottom: 0.25rem;
          }

          small {
            display: block;
            color: #718096;
            font-size: 0.75rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .timestamp {
          font-size: 0.75rem;
          color: #a0aec0;
        }
      }
    }

    .session-controls {
      h3 {
        margin: 0 0 1.5rem 0;
        font-size: 1.125rem;
        color: #2d3748;
      }

      .control-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 2rem;
      }

      .qr-section {
        padding-top: 1.5rem;
        border-top: 2px solid rgba(163, 177, 198, 0.2);

        h4 {
          margin: 0 0 1rem 0;
          color: #2d3748;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .qr-placeholder {
          aspect-ratio: 1;
          background: rgba(124, 156, 191, 0.1);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;

          p {
            margin: 0;
            font-size: 3rem;
          }

          small {
            color: #718096;
            font-size: 0.75rem;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #718096;

      .empty-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
      }
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .full-width {
      width: 100%;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .dashboard-row {
        grid-template-columns: 1fr;
      }

      .session-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 576px) {
      .session-stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ActiveSessionComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(AttendanceSessionService);
  
  sessionId: string | null = null;
  session = signal<any>(null);
  attendedStudents = signal<any[]>([]);
  loading = signal<boolean>(false);
  lastUpdate = signal<Date>(new Date());
  
  private refreshSubscription?: Subscription;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/faculty/dashboard', icon: '🏠' },
    { label: 'My Subjects', route: '/faculty/my-subjects', icon: '📚' },
    { label: 'Open Session', route: '/faculty/open-session', icon: '🚀' },
    { label: 'Session History', route: '/faculty/session-history', icon: '📜' },
    { label: 'Reports', route: '/faculty/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('id');
    if (this.sessionId) {
      this.loadSessionData();
      this.startAutoRefresh();
    }
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private loadSessionData() {
    if (!this.sessionId) return;
    
    this.loading.set(true);
    this.sessionService.getSessionById(Number(this.sessionId)).subscribe({
      next: (session) => {
        this.session.set(session);
        this.generateMockAttendedStudents(session.totalStudentsMarked || 0);
        this.lastUpdate.set(new Date());
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load session:', error);
        this.loading.set(false);
      }
    });
  }

  private generateMockAttendedStudents(count: number) {
    const students = [];
    for (let i = 1; i <= count; i++) {
      students.push({
        userId: i,
        userName: `Student ${i}`,
        userEmail: `student${i}@university.edu`,
        markedAt: new Date(Date.now() - Math.random() * 3600000)
      });
    }
    this.attendedStudents.set(students);
  }

  private startAutoRefresh() {
    this.refreshSubscription = interval(10000).subscribe(() => {
      this.loadSessionData();
    });
  }

  refreshSession() {
    this.loadSessionData();
  }

  closeSessionConfirm() {
    if (confirm('Are you sure you want to close this session?')) {
      if (this.sessionId) {
        this.sessionService.closeSession(Number(this.sessionId)).subscribe({
          next: () => {
            alert('Session closed successfully!');
            this.router.navigate(['/faculty/dashboard']);
          },
          error: (error) => {
            console.error('Failed to close session:', error);
            alert('Failed to close session. Please try again.');
          }
        });
      }
    }
  }

  downloadAttendance() {
    alert('Downloading attendance list...');
  }

  shareSession() {
    if (this.sessionId) {
      const link = `${window.location.origin}/student/mark-attendance?session=${this.sessionId}`;
      navigator.clipboard.writeText(link).then(() => {
        alert('Session link copied to clipboard!');
      });
    }
  }

  notifyStudents() {
    alert('Sending notifications to all enrolled students...');
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }

  calculateDuration(startTime: Date): string {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const minutes = Math.floor((now - start) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  calculateAttendanceRate(session: any): number {
    if (!session.totalStudents || session.totalStudents === 0) return 0;
    return Math.round((session.totalStudentsMarked / session.totalStudents) * 100);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
