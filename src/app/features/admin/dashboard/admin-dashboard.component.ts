import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
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
            <h1>Admin Dashboard</h1>
            <p>Welcome back! Here's your system overview</p>
          </div>

          <div class="stats-grid">
            <app-stats-card
              title="Total Students"
              [value]="stats()?.totalStudents || 0"
              icon="👨‍🎓"
              iconBackground="linear-gradient(135deg, #7c9cbf, #8b9dc3)"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="Total Faculty"
              [value]="stats()?.totalFaculty || 0"
              icon="👨‍🏫"
              iconBackground="linear-gradient(135deg, #8b9dc3, #7c9cbf)"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="Total Subjects"
              [value]="stats()?.totalSubjects || 0"
              icon="📚"
              iconBackground="linear-gradient(135deg, #7bc043, #6aa839)"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="Pending Requests"
              [value]="stats()?.pendingDeviceRequests || 0"
              icon="⏳"
              iconBackground="linear-gradient(135deg, #ffa62b, #ff9020)"
              trend="up"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="Overall Attendance"
              [value]="stats()?.overallAttendanceRate || 0"
              suffix="%"
              icon="📊"
              iconBackground="linear-gradient(135deg, #7c9cbf, #8b9dc3)"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="Low Attendance"
              [value]="stats()?.lowAttendanceStudentsCount || 0"
              icon="⚠️"
              iconBackground="linear-gradient(135deg, #ee4266, #dc3758)"
              subtitle="Students below 75%"
              [clickable]="true"
            ></app-stats-card>
          </div>

          <div class="quick-actions clay-card">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
              <button class="action-button clay-button" routerLink="/admin/subjects/create">
                <span class="action-icon">➕</span>
                <span>Create Subject</span>
              </button>
              <button class="action-button clay-button" routerLink="/admin/device-requests">
                <span class="action-icon">📱</span>
                <span>Review Requests ({{ stats()?.pendingDeviceRequests || 0 }})</span>
              </button>
              <button class="action-button clay-button" routerLink="/admin/subjects">
                <span class="action-icon">📚</span>
                <span>Manage Subjects</span>
              </button>
              <button class="action-button clay-button" routerLink="/admin/low-attendance">
                <span class="action-icon">⚠️</span>
                <span>Low Attendance Report</span>
              </button>
            </div>
          </div>

          <div class="recent-activity clay-card">
            <h2>System Overview</h2>
            <div class="overview-grid">
              <div class="overview-item">
                <span class="overview-label">Active Sessions</span>
                <span class="overview-value">0</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">Today's Attendance</span>
                <span class="overview-value">0</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">This Month</span>
                <span class="overview-value">0</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">System Health</span>
                <span class="overview-value status-good">Good</span>
              </div>
            </div>
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .action-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 1rem;
        text-align: center;
        white-space: nowrap;

        .action-icon {
          font-size: 2rem;
        }

        span:last-child {
          font-size: 0.875rem;
          font-weight: 600;
        }
      }
    }

    .recent-activity {
      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .overview-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .overview-label {
          font-size: 0.75rem;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .overview-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;

          &.status-good {
            color: #7bc043;
          }
        }
      }
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }

    @media (max-width: 576px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions .actions-grid {
        grid-template-columns: 1fr;
      }

      .overview-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<any>(null);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' },
    { label: 'Subjects', route: '/admin/subjects', icon: '📚' },
    { label: 'Device Requests', route: '/admin/device-requests', icon: '📱' },
    { label: 'Low Attendance', route: '/admin/low-attendance', icon: '⚠️' },
    { label: 'Users', route: '/admin/users', icon: '👥' },
    { label: 'Reports', route: '/admin/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadDashboardStats();
  }

  private loadDashboardStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (error) => console.error('Failed to load dashboard stats:', error)
    });
  }
}
