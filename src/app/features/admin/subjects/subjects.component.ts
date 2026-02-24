import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { SubjectService } from '../../shared/services/subject.service';

@Component({
  selector: 'app-admin-subjects',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>Manage Subjects</h1>
            <p>Create, edit, and manage all subjects in the system</p>
          </div>

          <div class="actions clay-card">
            <button class="clay-button primary" routerLink="/admin/subjects/create">
              <span class="action-icon">➕</span> Create New Subject
            </button>
          </div>

          @if (subjects().length > 0) {
            <div class="subjects-list clay-card">
              <table class="subjects-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Faculty</th>
                    <th>Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (subject of subjects(); track subject.subjectId) {
                    <tr>
                      <td>{{ subject.subjectCode }}</td>
                      <td>{{ subject.subjectName }}</td>
                      <td>{{ subject.facultyName || '-' }}</td>
                      <td>{{ subject.studentCount || 0 }}</td>
                      <td>
                        <button class="clay-button small" [routerLink]="['/admin/subjects/edit', subject.subjectId]">
                          Edit
                        </button>
                        <button class="clay-button small danger" (click)="deleteSubject(subject.subjectId)">
                          Delete
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>No subjects found</p>
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

    .actions {
      margin-bottom: 2rem;
    }

    .subjects-list {
      overflow-x: auto;
    }

    .subjects-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: rgba(124, 156, 191, 0.1);
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: #2d3748;
        border-bottom: 2px solid rgba(163, 177, 198, 0.2);
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid rgba(163, 177, 198, 0.2);
        color: #2d3748;
      }

      tr:hover {
        background: rgba(124, 156, 191, 0.05);
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
    }
  `]
})
export class AdminSubjectsComponent implements OnInit {
  private subjectService = inject(SubjectService);

  subjects = signal<any[]>([]);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' },
    { label: 'Subjects', route: '/admin/subjects', icon: '📚' },
    { label: 'Device Requests', route: '/admin/device-requests', icon: '📱' },
    { label: 'Low Attendance', route: '/admin/low-attendance', icon: '⚠️' },
    { label: 'Users', route: '/admin/users', icon: '👥' },
    { label: 'Reports', route: '/admin/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadSubjects();
  }

  private loadSubjects() {
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => this.subjects.set(subjects),
      error: (error) => console.error('Failed to load subjects:', error)
    });
  }

  deleteSubject(subjectId: number) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.subjectService.deleteSubject(subjectId).subscribe({
        next: () => {
          this.loadSubjects();
        },
        error: (error) => console.error('Failed to delete subject:', error)
      });
    }
  }
}
