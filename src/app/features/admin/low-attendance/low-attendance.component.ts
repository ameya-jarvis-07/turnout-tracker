import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AttendanceService } from '../../shared/services/attendance.service';

@Component({
  selector: 'app-low-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>Low Attendance Report</h1>
            <p>Students with attendance below 75%</p>
          </div>

          <div class="filter-section clay-card">
            <div class="filter-group">
              <label>Subject:</label>
              <select class="clay-input" (change)="onSubjectChange($event)">
                <option value="">All Subjects</option>
                @for (subject of subjects(); track subject.subjectId) {
                  <option [value]="subject.subjectId">{{ subject.subjectName }}</option>
                }
              </select>
            </div>
            <div class="filter-group">
              <label>Threshold:</label>
              <input type="number" class="clay-input" min="0" max="100" [(ngModel)]="threshold" (change)="filterStudents()" />
            </div>
          </div>

          @if (filteredStudents().length > 0) {
            <div class="students-list">
              @for (student of filteredStudents(); track student.studentId) {
                <div class="student-card clay-card">
                  <div class="student-header">
                    <div>
                      <h3>{{ student.studentName }}</h3>
                      <p class="student-email">{{ student.studentEmail }}</p>
                    </div>
                    <span class="status-badge critical">
                      {{ student.attendance.toFixed(1) }}%
                    </span>
                  </div>
                  <div class="attendance-bar">
                    <div class="progress-bar" [style.width.%]="student.attendance">
                    </div>
                  </div>
                  <div class="student-details">
                    <span>{{ student.presentClasses }}/{{ student.totalClasses }} classes attended</span>
                  </div>
                  <button class="clay-button primary full-width" (click)="contactStudent(student.studentId)">
                    📧 Send Notification
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>No students with low attendance</p>
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

    .filter-section {
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;

      .filter-group {
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2d3748;
        }
      }
    }

    .students-list {
      display: grid;
      gap: 1rem;
    }

    .student-card {
      padding: 1.5rem;

      .student-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 1rem;

        h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.125rem;
        }

        .student-email {
          margin: 0.25rem 0 0 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-weight: 700;
          font-size: 1rem;
          background: rgba(238, 66, 102, 0.2);
          color: #ee4266;
        }
      }

      .attendance-bar {
        height: 8px;
        background: rgba(124, 156, 191, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 1rem;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ee4266, #ff6b7a);
          border-radius: 4px;
        }
      }

      .student-details {
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #718096;
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
    }
  `]
})
export class LowAttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);

  students = signal<any[]>([]);
  subjects = signal<any[]>([]);
  threshold = 75;
  selectedSubject = '';

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' },
    { label: 'Subjects', route: '/admin/subjects', icon: '📚' },
    { label: 'Device Requests', route: '/admin/device-requests', icon: '📱' },
    { label: 'Low Attendance', route: '/admin/low-attendance', icon: '⚠️' },
    { label: 'Users', route: '/admin/users', icon: '👥' },
    { label: 'Reports', route: '/admin/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    // Mock data - replace with actual service calls
    this.students.set([
      {
        studentId: 1,
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        attendance: 60,
        presentClasses: 9,
        totalClasses: 15,
        subjectId: 1
      },
      {
        studentId: 2,
        studentName: 'Jane Smith',
        studentEmail: 'jane@example.com',
        attendance: 72,
        presentClasses: 11,
        totalClasses: 15,
        subjectId: 2
      }
    ]);

    this.subjects.set([
      { subjectId: 1, subjectName: 'Mathematics' },
      { subjectId: 2, subjectName: 'Physics' }
    ]);
  }

  filteredStudents() {
    return this.students().filter(s => s.attendance < this.threshold);
  }

  onSubjectChange(event: any) {
    this.selectedSubject = event.target.value;
    this.filterStudents();
  }

  filterStudents() {
    // Filter logic here
  }

  contactStudent(studentId: number) {
    alert(`Notification sent to student ${studentId}`);
  }
}
