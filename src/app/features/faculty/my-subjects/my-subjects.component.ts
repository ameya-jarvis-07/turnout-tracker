import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { SubjectService } from '../../shared/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-subjects',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>My Subjects</h1>
            <p>View and manage all your assigned subjects</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card clay-card">
              <div class="stat-value">{{ mySubjects().length }}</div>
              <div class="stat-label">Total Subjects</div>
            </div>
            <div class="stat-card clay-card">
              <div class="stat-value">{{ totalStudents() }}</div>
              <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card clay-card">
              <div class="stat-value">{{ averageAttendance().toFixed(1) }}%</div>
              <div class="stat-label">Avg Attendance</div>
            </div>
          </div>

          @if (mySubjects().length > 0) {
            <div class="subjects-grid">
              @for (subject of mySubjects(); track subject.subjectId) {
                <div class="subject-card clay-card">
                  <div class="subject-header">
                    <h3>{{ subject.subjectName }}</h3>
                    <span class="subject-code">{{ subject.subjectCode }}</span>
                  </div>
                  <div class="subject-info">
                    <div class="info-item">
                      <span class="label">Students:</span>
                      <span class="value">{{ subject.studentCount || 0 }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Sessions:</span>
                      <span class="value">{{ subject.sessionCount || 0 }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Avg Attendance:</span>
                      <span class="value">{{ subject.averageAttendance || 0 }}%</span>
                    </div>
                  </div>
                  <div class="subject-actions">
                    <button class="clay-button" [routerLink]="['/faculty/subject-attendance', subject.subjectId]">
                      👁️ View Details
                    </button>
                    <button class="clay-button secondary" [routerLink]="['/faculty/subject-report', subject.subjectId]">
                      📊 Report
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>No subjects assigned yet</p>
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;

      .stat-card {
        padding: 1.5rem;
        text-align: center;

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #7c9cbf;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #718096;
        }
      }
    }

    .subjects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .subject-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .subject-header {
        border-bottom: 2px solid rgba(124, 156, 191, 0.2);
        padding-bottom: 1rem;

        h3 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 1.125rem;
        }

        .subject-code {
          display: inline-block;
          background: rgba(124, 156, 191, 0.1);
          color: #7c9cbf;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: monospace;
          font-weight: 600;
        }
      }

      .subject-info {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .info-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;

          .label {
            color: #718096;
            font-weight: 500;
          }

          .value {
            color: #2d3748;
            font-weight: 600;
          }
        }
      }

      .subject-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: auto;

        button {
          flex: 1;
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

      .subjects-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MySubjectsComponent implements OnInit {
  private subjectService = inject(SubjectService);
  private authService = inject(AuthService);

  mySubjects = signal<any[]>([]);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/faculty/dashboard', icon: '🏠' },
    { label: 'My Subjects', route: '/faculty/my-subjects', icon: '📚' },
    { label: 'Open Session', route: '/faculty/open-session', icon: '🚀' },
    { label: 'Session History', route: '/faculty/session-history', icon: '📜' },
    { label: 'Reports', route: '/faculty/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadMySubjects();
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

  totalStudents() {
    return this.mySubjects().reduce((sum, s) => sum + (s.studentCount || 0), 0);
  }

  averageAttendance() {
    const subjects = this.mySubjects();
    if (subjects.length === 0) return 0;
    return subjects.reduce((sum, s) => sum + (s.averageAttendance || 0), 0) / subjects.length;
  }
}
