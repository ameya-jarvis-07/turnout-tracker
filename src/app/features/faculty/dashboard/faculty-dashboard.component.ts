import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { SubjectService } from '../../shared/services/subject.service';
import { AttendanceSessionService } from '../../shared/services/attendance-session.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    StatsCardComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        
        <main class="main-content">
          <div class="page-header">
            <h1>Faculty Dashboard</h1>
            <p>Manage your subjects and attendance sessions</p>
          </div>

          <div class="stats-grid">
            <app-stats-card
              title="My Subjects"
              [value]="mySubjects().length"
              icon="📚"
              iconBackground="linear-gradient(135deg, #7c9cbf, #8b9dc3)"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="Active Sessions"
              [value]="activeSessions().length"
              icon="🟢"
              iconBackground="linear-gradient(135deg, #7bc043, #6aa839)"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="Today's Attendance"
              [value]="todayAttendance()"
              icon="✓"
              iconBackground="linear-gradient(135deg, #8b9dc3, #7c9cbf)"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="This Month"
              [value]="monthSessions()"
              subtitle="Total sessions"
              icon="📊"
              iconBackground="linear-gradient(135deg, #ffa62b, #ff9020)"
              [clickable]="true"
            ></app-stats-card>
          </div>

          <div class="quick-actions clay-card">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
              <button class="action-button clay-button primary" routerLink="/faculty/open-session">
                <span class="action-icon">🚀</span>
                <span>Open Session</span>
              </button>
              <button class="action-button clay-button" routerLink="/faculty/my-subjects">
                <span class="action-icon">📚</span>
                <span>My Subjects</span>
              </button>
              <button class="action-button clay-button" routerLink="/faculty/session-history">
                <span class="action-icon">📜</span>
                <span>Session History</span>
              </button>
              <button class="action-button clay-button" routerLink="/faculty/reports">
                <span class="action-icon">📊</span>
                <span>View Reports</span>
              </button>
            </div>
          </div>

          @if (activeSessions().length > 0) {
            <div class="active-sessions clay-card">
              <h2>Active Sessions</h2>
              <div class="sessions-list">
                @for (session of activeSessions(); track session.sessionId) {
                  <div class="session-item clay-card-inset">
                    <div class="session-info">
                      <h3>{{ session.subjectName }}</h3>
                      <p>Started: {{ formatTime(session.startTime) }}</p>
                      <p class="students-count">
                        <strong>{{ session.totalStudentsMarked }}</strong> students marked
                      </p>
                    </div>
                    <div class="session-actions">
                      <button class="clay-button" [routerLink]="['/faculty/active-session', session.sessionId]">
                        View
                      </button>
                      <button class="clay-button danger" (click)="closeSession(session.sessionId)">
                        Close
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <div class="my-subjects clay-card">
            <h2>My Subjects</h2>
            @if (mySubjects().length === 0) {
              <p class="empty-state">No subjects assigned yet</p>
            } @else {
              <div class="subjects-grid">
                @for (subject of mySubjects(); track subject.subjectId) {
                  <div class="subject-card clay-card-inset" [routerLink]="['/faculty/subject-attendance', subject.subjectId]">
                    <h3>{{ subject.subjectName }}</h3>
                    @if (subject.subjectCode) {
                      <p class="subject-code">{{ subject.subjectCode }}</p>
                    }
                    <button class="clay-button">View Attendance</button>
                  </div>
                }
              </div>
            }
          </div>
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

    .quick-actions {
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .action-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 1rem;
        text-align: center;

        .action-icon {
          font-size: 2rem;
        }

        span:last-child {
          font-size: 0.875rem;
          font-weight: 600;
        }
      }
    }

    .active-sessions {
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .sessions-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .session-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;

        .session-info {
          flex: 1;

          h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.125rem;
            color: #2d3748;
          }

          p {
            margin: 0.25rem 0;
            font-size: 0.875rem;
            color: #718096;

            &.students-count {
              margin-top: 0.5rem;
              color: #7c9cbf;

              strong {
                font-size: 1.25rem;
              }
            }
          }
        }

        .session-actions {
          display: flex;
          gap: 0.5rem;
        }
      }
    }

    .my-subjects {
      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .empty-state {
        text-align: center;
        color: #718096;
        padding: 2rem;
      }

      .subjects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }

      .subject-card {
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;

        &:hover {
          transform: translateY(-2px);
        }

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          color: #2d3748;
        }

        .subject-code {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          color: #718096;
          font-family: monospace;
        }

        button {
          width: 100%;
        }
      }
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .session-item {
        flex-direction: column;
        text-align: center;
      }
    }

    @media (max-width: 576px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class FacultyDashboardComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private sessionService = inject(AttendanceSessionService);
  private authService = inject(AuthService);

  mySubjects = signal<any[]>([]);
  activeSessions = signal<any[]>([]);
  todayAttendance = signal(0);
  monthSessions = signal(0);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/faculty/dashboard', icon: '🏠' },
    { label: 'My Subjects', route: '/faculty/my-subjects', icon: '📚' },
    { label: 'Open Session', route: '/faculty/open-session', icon: '🚀' },
    { label: 'Session History', route: '/faculty/session-history', icon: '📜' },
    { label: 'Reports', route: '/faculty/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadMySubjects();
    this.loadActiveSessions();
  }

  private loadMySubjects() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.subjectService.getSubjectsByFaculty(currentUser.userId).subscribe({
        next: (subjects) => this.mySubjects.set(subjects),
        error: (error) => console.error('Failed to load subjects:', error)
      });
    }
  }

  private loadActiveSessions() {
    this.sessionService.getAllActiveSessions().subscribe({
      next: (sessions) => {
        const currentUser = this.authService.getCurrentUser();
        const mySessions = sessions.filter(s => s.openedByFacultyId === currentUser?.userId);
        this.activeSessions.set(mySessions);
      },
      error: (error) => console.error('Failed to load sessions:', error)
    });
  }

  closeSession(sessionId: number) {
    if (confirm('Are you sure you want to close this session?')) {
      this.sessionService.closeSession(sessionId).subscribe({
        next: () => {
          this.loadActiveSessions();
        },
        error: (error) => console.error('Failed to close session:', error)
      });
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
