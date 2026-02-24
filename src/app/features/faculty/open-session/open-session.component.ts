import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { SubjectService } from '../../shared/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceSessionService } from '../../shared/services/attendance-session.service';

@Component({
  selector: 'app-open-session',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>Open Attendance Session</h1>
            <p>Start a new attendance session for your students</p>
          </div>

          <div class="form-container clay-card">
            <form (ngSubmit)="openSession()">
              <div class="form-group">
                <label for="subject">Select Subject *</label>
                <select 
                  id="subject" 
                  class="clay-input" 
                  [(ngModel)]="selectedSubject" 
                  name="subject"
                  required>
                  <option value="">-- Choose a subject --</option>
                  @for (subject of mySubjects(); track subject.subjectId) {
                    <option [value]="subject.subjectId">
                      {{ subject.subjectName }} ({{ subject.subjectCode }})
                    </option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label for="description">Session Description</label>
                <textarea 
                  id="description" 
                  class="clay-input" 
                  [(ngModel)]="description" 
                  name="description"
                  rows="4"
                  placeholder="Enter any additional details for this session..."></textarea>
              </div>

              <div class="form-group">
                <label for="duration">Session Duration (minutes)</label>
                <input 
                  type="number" 
                  id="duration" 
                  class="clay-input" 
                  [(ngModel)]="duration" 
                  name="duration"
                  min="5"
                  max="240"
                  value="30" />
              </div>

              <div class="form-actions">
                <button type="submit" class="clay-button primary" [disabled]="!selectedSubject || isOpening()">
                  @if (isOpening()) {
                    <span>Opening Session...</span>
                  } @else {
                    <span>🚀 Open Session</span>
                  }
                </button>
                <button type="button" class="clay-button secondary" routerLink="/faculty/dashboard">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          @if (openSessions().length > 0) {
            <div class="active-sessions clay-card">
              <h2>Your Active Sessions</h2>
              <div class="sessions-list">
                @for (session of openSessions(); track session.sessionId) {
                  <div class="session-item">
                    <div>
                      <h3>{{ session.subjectName }}</h3>
                      <p>Opened at {{ formatTime(session.startTime) }}</p>
                      <p class="students-count">
                        <strong>{{ session.totalStudentsMarked }}</strong> students marked
                      </p>
                    </div>
                    <button class="clay-button danger" (click)="closeSession(session.sessionId)">
                      Close Session
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

    .form-container {
      max-width: 600px;
      padding: 2rem;
      margin-bottom: 2rem;

      form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 600;
        color: #2d3748;
        font-size: 0.875rem;
      }

      input, select, textarea {
        padding: 0.75rem;
        border: 1px solid rgba(163, 177, 198, 0.3);
        border-radius: 8px;
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: #7c9cbf;
          box-shadow: inset 0 0 0 2px rgba(124, 156, 191, 0.1);
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;

      button {
        flex: 1;
      }
    }

    .active-sessions {
      h2 {
        margin: 0 0 1.5rem 0;
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
        padding: 1.5rem;
        background: rgba(124, 156, 191, 0.05);
        border-radius: 8px;
        border-left: 4px solid #7c9cbf;

        h3 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 1.125rem;
        }

        p {
          margin: 0.25rem 0;
          color: #718096;
          font-size: 0.875rem;

          &.students-count {
            margin-top: 0.5rem;
            color: #7c9cbf;

            strong {
              font-size: 1rem;
            }
          }
        }
      }
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .session-item {
        flex-direction: column;
        align-items: flex-start;

        button {
          align-self: flex-end;
        }
      }
    }
  `]
})
export class OpenSessionComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private sessionService = inject(AttendanceSessionService);
  private authService = inject(AuthService);

  mySubjects = signal<any[]>([]);
  openSessions = signal<any[]>([]);
  selectedSubject = '';
  description = '';
  duration = 30;
  isOpening = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/faculty/dashboard', icon: '🏠' },
    { label: 'My Subjects', route: '/faculty/my-subjects', icon: '📚' },
    { label: 'Open Session', route: '/faculty/open-session', icon: '🚀' },
    { label: 'Session History', route: '/faculty/session-history', icon: '📜' },
    { label: 'Reports', route: '/faculty/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadMySubjects();
    this.loadOpenSessions();
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

  private loadOpenSessions() {
    this.sessionService.getAllActiveSessions().subscribe({
      next: (sessions) => {
        const currentUser = this.authService.getCurrentUser();
        const mySessions = sessions.filter(s => s.openedByFacultyId === currentUser?.userId);
        this.openSessions.set(mySessions);
      },
      error: (error) => console.error('Failed to load sessions:', error)
    });
  }

  openSession() {
    if (!this.selectedSubject) {
      alert('Please select a subject');
      return;
    }

    this.isOpening.set(true);
    const currentUser = this.authService.getCurrentUser();

    const sessionData = {
      subjectId: parseInt(this.selectedSubject),
      description: this.description,
      duration: this.duration,
      openedByFacultyId: currentUser?.userId
    };

    // Using createSession method from service or fallback
    const createMethod = (this.sessionService as any).createSession || (this.sessionService as any).openSession;
    createMethod.call(this.sessionService, sessionData).subscribe({
      next: () => {
        alert('Session opened successfully!');
        this.loadOpenSessions();
        this.resetForm();
        this.isOpening.set(false);
      },
      error: (error: HttpErrorResponse) => {
        alert('Failed to open session');
        this.isOpening.set(false);
      }
    });
  }

  closeSession(sessionId: number) {
    if (confirm('Are you sure you want to close this session?')) {
      this.sessionService.closeSession(sessionId).subscribe({
        next: () => {
          this.loadOpenSessions();
        },
        error: (error) => console.error('Failed to close session:', error)
      });
    }
  }

  private resetForm() {
    this.selectedSubject = '';
    this.description = '';
    this.duration = 30;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
