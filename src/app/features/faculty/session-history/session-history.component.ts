import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AttendanceSessionService } from '../../shared/services/attendance-session.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>Session History</h1>
            <p>View all your past and current attendance sessions</p>
          </div>

          <div class="filter-tabs">
            <button class="tab-button" [class.active]="activeTab() === 'active'" (click)="activeTab.set('active')">
              Active ({{ countByStatus('active') }})
            </button>
            <button class="tab-button" [class.active]="activeTab() === 'closed'" (click)="activeTab.set('closed')">
              Closed ({{ countByStatus('closed') }})
            </button>
            <button class="tab-button" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">
              All ({{ sessions().length }})
            </button>
          </div>

          @if (filteredSessions().length > 0) {
            <div class="sessions-list">
              @for (session of filteredSessions(); track session.sessionId) {
                <div class="session-item clay-card">
                  <div class="session-header">
                    <div>
                      <h3>{{ session.subjectName }}</h3>
                      <p class="session-code">{{ session.subjectCode }}</p>
                    </div>
                    <span class="status-badge" [ngClass]="session.status">
                      {{ session.status | uppercase }}
                    </span>
                  </div>
                  <div class="session-details">
                    <div class="detail">
                      <span class="label">Started:</span>
                      <span>{{ formatDateTime(session.startTime) }}</span>
                    </div>
                    @if (session.endTime) {
                      <div class="detail">
                        <span class="label">Ended:</span>
                        <span>{{ formatDateTime(session.endTime) }}</span>
                      </div>
                    }
                    <div class="detail">
                      <span class="label">Students Marked:</span>
                      <span>{{ session.totalStudentsMarked }}</span>
                    </div>
                    <div class="detail">
                      <span class="label">Total Students:</span>
                      <span>{{ session.totalStudents }}</span>
                    </div>
                  </div>
                  <div class="session-actions">
                    <button class="clay-button small" [routerLink]="['/faculty/session-details', session.sessionId]">
                      View Details
                    </button>
                    @if (session.status === 'active') {
                      <button class="clay-button small danger" (click)="closeSession(session.sessionId)">
                        Close
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>No sessions found</p>
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

    .filter-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(163, 177, 198, 0.2);

      .tab-button {
        padding: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #718096;
        font-weight: 500;
        border-bottom: 2px solid transparent;
        transition: all 0.3s ease;

        &:hover {
          color: #2d3748;
        }

        &.active {
          color: #7c9cbf;
          border-bottom-color: #7c9cbf;
        }
      }
    }

    .sessions-list {
      display: grid;
      gap: 1rem;
    }

    .session-item {
      padding: 1.5rem;

      .session-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 1rem;
        border-bottom: 1px solid rgba(163, 177, 198, 0.2);
        padding-bottom: 1rem;

        h3 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 1.125rem;
        }

        .session-code {
          margin: 0;
          color: #718096;
          font-size: 0.875rem;
          font-family: monospace;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;

          &.active {
            background: rgba(123, 192, 67, 0.2);
            color: #7bc043;
          }

          &.closed {
            background: rgba(124, 156, 191, 0.2);
            color: #7c9cbf;
          }
        }
      }

      .session-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;

        .detail {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;

          .label {
            font-weight: 600;
            color: #2d3748;
          }

          span {
            color: #718096;
          }
        }
      }

      .session-actions {
        display: flex;
        gap: 0.75rem;
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

      .session-item .session-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SessionHistoryComponent implements OnInit {
  private sessionService = inject(AttendanceSessionService);
  private authService = inject(AuthService);

  sessions = signal<any[]>([]);
  activeTab = signal<'active' | 'closed' | 'all'>('all');

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/faculty/dashboard', icon: '🏠' },
    { label: 'My Subjects', route: '/faculty/my-subjects', icon: '📚' },
    { label: 'Open Session', route: '/faculty/open-session', icon: '🚀' },
    { label: 'Session History', route: '/faculty/session-history', icon: '📜' },
    { label: 'Reports', route: '/faculty/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadSessions();
  }

  private loadSessions() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const getMethod = (this.sessionService as any).getSessionsByFaculty || (this.sessionService as any).getAllActiveSessions;
      getMethod.call(this.sessionService, currentUser.userId).subscribe({
        next: (sessions: any[]) => this.sessions.set(sessions),
        error: (error: any) => console.error('Failed to load sessions:', error)
      });
    }
  }

  filteredSessions() {
    const tab = this.activeTab();
    if (tab === 'all') {
      return this.sessions();
    }
    return this.sessions().filter(s => s.status === tab);
  }

  countByStatus(status: string) {
    return this.sessions().filter(s => s.status === status).length;
  }

  closeSession(sessionId: number) {
    if (confirm('Are you sure you want to close this session?')) {
      this.sessionService.closeSession(sessionId).subscribe({
        next: () => {
          this.loadSessions();
        },
        error: (error) => console.error('Failed to close session:', error)
      });
    }
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
