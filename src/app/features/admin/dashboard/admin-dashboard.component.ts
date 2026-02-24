import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { AdminService, ActivityLogDto, SystemHealthDto } from '../../shared/services/admin.service';
import { interval, Subscription } from 'rxjs';

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
            <div>
              <h1>Admin Dashboard</h1>
              <p>Welcome back! Here's your system overview - Last updated: {{ lastUpdated() | date:'short' }}</p>
            </div>
            <div class="header-actions">
              <button class="clay-button icon-button" (click)="refreshData()" [disabled]="loading()">
                <span class="icon">🔄</span>
              </button>
              <button class="clay-button" (click)="showExportDialog = true">
                📊 Export Report
              </button>
            </div>
          </div>

          <!-- System Health Alert -->
          @if (systemHealth()) {
            <div class="health-alert clay-card" [class.warning]="systemHealth()?.status === 'warning'" [class.critical]="systemHealth()?.status === 'critical'">
              <div class="health-content">
                <span class="health-icon">
                  @if (systemHealth()?.status === 'good') { ✅ }
                  @else if (systemHealth()?.status === 'warning') { ⚠️ }
                  @else { 🚨 }
                </span>
                <div>
                  <strong>System Health: {{ systemHealth()?.status?.toUpperCase() }}</strong>
                  <p>Database: {{ systemHealth()?.databaseStatus }} | Active Users: {{ systemHealth()?.activeUsers }}</p>
                </div>
              </div>
              <button class="clay-button secondary" routerLink="/admin/system-settings">View Details</button>
            </div>
          }

          <!-- Main Statistics Grid -->
          <div class="stats-grid">
            <app-stats-card
              title="Total Students"
              [value]="stats()?.totalStudents || 0"
              icon="👨‍🎓"
              iconBackground="linear-gradient(135deg, #7c9cbf, #8b9dc3)"
              [clickable]="true"
              (click)="navigateToUsers('Student')"
            ></app-stats-card>

            <app-stats-card
              title="Total Faculty"
              [value]="stats()?.totalFaculty || 0"
              icon="👨‍🏫"
              iconBackground="linear-gradient(135deg, #8b9dc3, #7c9cbf)"
              [clickable]="true"
              (click)="navigateToUsers('Faculty')"
            ></app-stats-card>

            <app-stats-card
              title="Total Subjects"
              [value]="stats()?.totalSubjects || 0"
              icon="📚"
              iconBackground="linear-gradient(135deg, #7bc043, #6aa839)"
              [clickable]="true"
              (click)="navigateToSubjects()"
            ></app-stats-card>

            <app-stats-card
              title="Pending Requests"
              [value]="stats()?.pendingDeviceRequests || 0"
              icon="⏳"
              iconBackground="linear-gradient(135deg, #ffa62b, #ff9020)"
              [trend]="(stats()?.pendingDeviceRequests || 0) > 0 ? 'up' : undefined"
              [clickable]="true"
              (click)="navigateToRequests()"
            ></app-stats-card>

            <app-stats-card
              title="Overall Attendance"
              [value]="stats()?.overallAttendanceRate || 0"
              suffix="%"
              icon="📊"
              iconBackground="linear-gradient(135deg, #7c9cbf, #8b9dc3)"
              [trend]="(stats()?.overallAttendanceRate || 0) >= 75 ? 'up' : 'down'"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="Low Attendance"
              [value]="stats()?.lowAttendanceStudentsCount || 0"
              icon="⚠️"
              iconBackground="linear-gradient(135deg, #ee4266, #dc3758)"
              subtitle="Students below 75%"
              [clickable]="true"
              (click)="navigateToLowAttendance()"
            ></app-stats-card>

            <app-stats-card
              title="Active Sessions"
              [value]="stats()?.activeSessions || 0"
              icon="🟢"
              iconBackground="linear-gradient(135deg, #7bc043, #6aa839)"
              subtitle="Live now"
              [clickable]="true"
            ></app-stats-card>

            <app-stats-card
              title="New Users"
              [value]="stats()?.newUsersThisMonth || 0"
              icon="👤"
              iconBackground="linear-gradient(135deg, #8b9dc3, #7c9cbf)"
              subtitle="This month"
              [trend]="(stats()?.newUsersThisMonth || 0) > 0 ? 'up' : undefined"
              [clickable]="true"
            ></app-stats-card>
          </div>

          <!-- Quick Actions Panel -->
          <div class="quick-actions clay-card">
            <h2>⚡ Quick Actions</h2>
            <div class="actions-grid">
              <button class="action-button clay-button" routerLink="/admin/subjects/create">
                <span class="action-icon">➕</span>
                <span>Create Subject</span>
              </button>
              <button class="action-button clay-button" routerLink="/admin/device-requests">
                <span class="action-icon">📱</span>
                <span>Review Requests</span>
                @if ((stats()?.pendingDeviceRequests || 0) > 0) {
                  <span class="badge">{{ stats()?.pendingDeviceRequests }}</span>
                }
              </button>
              <button class="action-button clay-button" routerLink="/admin/subjects">
                <span class="action-icon">📚</span>
                <span>Manage Subjects</span>
              </button>
              <button class="action-button clay-button" routerLink="/admin/low-attendance">
                <span class="action-icon">⚠️</span>
                <span>Low Attendance</span>
              </button>
              <button class="action-button clay-button" routerLink="/admin/users">
                <span class="action-icon">👥</span>
                <span>Manage Users</span>
              </button>
              <button class="action-button clay-button" routerLink="/admin/reports">
                <span class="action-icon">📈</span>
                <span>View Reports</span>
              </button>
              <button class="action-button clay-button" (click)="sendBulkNotification()">
                <span class="action-icon">📢</span>
                <span>Send Notification</span>
              </button>
              <button class="action-button clay-button" (click)="performMaintenance()">
                <span class="action-icon">🔧</span>
                <span>System Maintenance</span>
              </button>
            </div>
          </div>

          <div class="dashboard-row">
            <!-- Recent Activity Feed -->
            <div class="recent-activity clay-card">
              <div class="card-header">
                <h2>📝 Recent Activity</h2>
                <button class="clay-button icon-button small" (click)="refreshActivityLogs()">
                  🔄
                </button>
              </div>
              <div class="activity-list">
                @if (activityLogs().length > 0) {
                  @for (log of activityLogs().slice(0, 10); track log.activityId) {
                    <div class="activity-item">
                      <div class="activity-icon" [class]="getRoleClass(log.userRole)">
                        {{ getRoleIcon(log.userRole) }}
                      </div>
                      <div class="activity-content">
                        <div class="activity-header">
                          <strong>{{ log.userName }}</strong>
                          <span class="activity-action">{{ log.action }}</span>
                        </div>
                        <p>{{ log.description }}</p>
                        <small>{{ formatTimeAgo(log.timestamp) }}</small>
                      </div>
                    </div>
                  }
                } @else {
                  <div class="empty-state">
                    <p>No recent activity to display</p>
                    <button class="clay-button secondary" (click)="refreshActivityLogs()">
                      Refresh
                    </button>
                  </div>
                }
              </div>
              <button class="clay-button secondary full-width" (click)="viewAllActivities()">
                View All Activity Logs
              </button>
            </div>

            <!-- System Overview -->
            <div class="system-overview clay-card">
              <h2>🖥️ System Overview</h2>
              <div class="overview-list">
                <div class="overview-item">
                  <span class="overview-label">Active Sessions</span>
                  <span class="overview-value highlight">{{ stats()?.activeSessions || 0 }}</span>
                </div>
                <div class="overview-item">
                  <span class="overview-label">Today's Attendance</span>
                  <span class="overview-value">{{ stats()?.todayAttendance || 0 }}</span>
                </div>
                <div class="overview-item">
                  <span class="overview-label">This Month Sessions</span>
                  <span class="overview-value">{{ stats()?.thisMonthSessions || 0 }}</span>
                </div>
                <div class="overview-item">
                  <span class="overview-label">Database Status</span>
                  <span class="overview-value status-good">{{ systemHealth()?.databaseStatus || 'Connected' }}</span>
                </div>
                <div class="overview-item">
                  <span class="overview-label">Active Users</span>
                  <span class="overview-value">{{ systemHealth()?.activeUsers || 0 }}</span>
                </div>
                <div class="overview-item">
                  <span class="overview-label">Avg Response Time</span>
                  <span class="overview-value">{{ systemHealth()?.apiResponseTime || 0 }}ms</span>
                </div>
              </div>
              
              <div class="system-actions">
                <button class="clay-button secondary" (click)="clearSystemCache()">
                  🗑️ Clear Cache
                </button>
                <button class="clay-button secondary" (click)="generateSystemBackup()">
                  💾 Create Backup
                </button>
              </div>
            </div>
          </div>

          <!-- Critical Alerts Section -->
          @if ((stats()?.lowAttendanceStudentsCount || 0) > 0 || (stats()?.pendingDeviceRequests || 0) > 5) {
            <div class="alerts-section clay-card alert-warning">
              <h2>⚠️ Requires Attention</h2>
              <div class="alert-list">
                @if ((stats()?.lowAttendanceStudentsCount || 0) > 0) {
                  <div class="alert-item">
                    <span class="alert-icon">📉</span>
                    <div>
                      <strong>{{ stats()?.lowAttendanceStudentsCount }} students</strong> have attendance below 75%
                    </div>
                    <button class="clay-button secondary small" routerLink="/admin/low-attendance">
                      Review
                    </button>
                  </div>
                }
                @if ((stats()?.pendingDeviceRequests || 0) > 5) {
                  <div class="alert-item">
                    <span class="alert-icon">📱</span>
                    <div>
                      <strong>{{ stats()?.pendingDeviceRequests }} device requests</strong> pending approval
                    </div>
                    <button class="clay-button secondary small" routerLink="/admin/device-requests">
                      Review
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Export Dialog -->
          @if (showExportDialog) {
            <div class="modal-overlay" (click)="showExportDialog = false">
              <div class="modal-content clay-card" (click)="$event.stopPropagation()">
                <h2>Export Report</h2>
                <p>Select report type and format to export data</p>
                <div class="export-options">
                  <button class="clay-button" (click)="exportReport('attendance')">
                    📊 Attendance Report
                  </button>
                  <button class="clay-button" (click)="exportReport('users')">
                    👥 Users Report
                  </button>
                  <button class="clay-button" (click)="exportReport('subjects')">
                    📚 Subjects Report
                  </button>
                  <button class="clay-button" (click)="exportReport('low-attendance')">
                    ⚠️ Low Attendance Report
                  </button>
                </div>
                <button class="clay-button secondary full-width" (click)="showExportDialog = false">
                  Close
                </button>
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
      flex-wrap: wrap;
      gap: 1rem;

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

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .icon-button {
        padding: 0.75rem;
        min-width: auto;

        .icon {
          font-size: 1.25rem;
        }
      }
    }

    .health-alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      margin-bottom: 2rem;
      border-left: 4px solid #7bc043;

      &.warning {
        background: rgba(255, 166, 43, 0.1);
        border-left-color: #ffa62b;
      }

      &.critical {
        background: rgba(238, 66, 102, 0.1);
        border-left-color: #ee4266;
      }

      .health-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        .health-icon {
          font-size: 2rem;
        }

        strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          color: #718096;
          font-size: 0.875rem;
        }
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
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .action-button {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 1rem;
        text-align: center;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 2rem;
        }

        span:nth-child(2) {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #ee4266;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
        }
      }
    }

    .dashboard-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .recent-activity {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;

        h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #2d3748;
        }

        .small {
          padding: 0.5rem;
          font-size: 0.875rem;
        }
      }

      .activity-list {
        max-height: 500px;
        overflow-y: auto;
        margin-bottom: 1rem;
      }

      .activity-item {
        display: flex;
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

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;

          &.admin {
            background: linear-gradient(135deg, #ee4266, #dc3758);
          }

          &.faculty {
            background: linear-gradient(135deg, #7c9cbf, #8b9dc3);
          }

          &.student {
            background: linear-gradient(135deg, #7bc043, #6aa839);
          }
        }

        .activity-content {
          flex: 1;

          .activity-header {
            display: flex;
            gap: 0.5rem;
            align-items: baseline;
            margin-bottom: 0.25rem;

            strong {
              color: #2d3748;
            }

            .activity-action {
              color: #718096;
              font-size: 0.875rem;
            }
          }

          p {
            margin: 0.25rem 0;
            color: #4a5568;
            font-size: 0.875rem;
          }

          small {
            color: #a0aec0;
            font-size: 0.75rem;
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #718096;

        p {
          margin-bottom: 1rem;
        }
      }

      .full-width {
        width: 100%;
      }
    }

    .system-overview {
      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .overview-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .overview-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(163, 177, 198, 0.2);

        &:last-child {
          border-bottom: none;
        }

        .overview-label {
          font-size: 0.875rem;
          color: #718096;
        }

        .overview-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2d3748;

          &.highlight {
            color: #7bc043;
          }

          &.status-good {
            color: #7bc043;
          }

          &.status-warning {
            color: #ffa62b;
          }

          &.status-critical {
            color: #ee4266;
          }
        }
      }

      .system-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(163, 177, 198, 0.2);

        button {
          width: 100%;
        }
      }
    }

    .alerts-section {
      border-left: 4px solid #ffa62b;
      
      &.alert-warning {
        background: rgba(255, 166, 43, 0.05);
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .alert-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .alert-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: white;
        border-radius: 8px;

        .alert-icon {
          font-size: 2rem;
        }

        div {
          flex: 1;

          strong {
            color: #2d3748;
          }
        }

        .small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
      }
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      max-width: 500px;
      width: 100%;
      padding: 2rem;

      h2 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
      }

      p {
        margin: 0 0 1.5rem 0;
        color: #718096;
      }

      .export-options {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 1.5rem;

        button {
          width: 100%;
          justify-content: flex-start;
        }
      }

      .full-width {
        width: 100%;
      }
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .dashboard-row {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }

      .page-header {
        .header-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }

    @media (max-width: 576px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .health-alert {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .page-header {
        .header-actions {
          flex-direction: column;
          width: 100%;

          button {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private router = inject(Router);

  stats = signal<any>(null);
  activityLogs = signal<ActivityLogDto[]>([]);
  systemHealth = signal<SystemHealthDto | null>(null);
  loading = signal<boolean>(false);
  lastUpdated = signal<Date>(new Date());
  showExportDialog = false;

  private refreshSubscription?: Subscription;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' },
    { label: 'Subjects', route: '/admin/subjects', icon: '📚' },
    { label: 'Device Requests', route: '/admin/device-requests', icon: '📱' },
    { label: 'Low Attendance', route: '/admin/low-attendance', icon: '⚠️' },
    { label: 'Users', route: '/admin/users', icon: '👥' },
    { label: 'Reports', route: '/admin/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadDashboardData();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private loadDashboardData() {
    this.loading.set(true);
    this.loadDashboardStats();
    this.loadActivityLogs();
    this.loadSystemHealth();
  }

  private loadDashboardStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.lastUpdated.set(new Date());
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load dashboard stats:', error);
        this.loading.set(false);
      }
    });
  }

  private loadActivityLogs() {
    this.adminService.getActivityLogs(50).subscribe({
      next: (logs) => this.activityLogs.set(logs),
      error: (error) => console.error('Failed to load activity logs:', error)
    });
  }

  private loadSystemHealth() {
    this.adminService.getSystemHealth().subscribe({
      next: (health) => this.systemHealth.set(health),
      error: (error) => console.error('Failed to load system health:', error)
    });
  }

  private startAutoRefresh() {
    // Refresh dashboard stats every 60 seconds
    this.refreshSubscription = interval(60000).subscribe(() => {
      this.loadDashboardStats();
      this.loadSystemHealth();
    });
  }

  refreshData() {
    this.loadDashboardData();
  }

  refreshActivityLogs() {
    this.loadActivityLogs();
  }

  // Navigation methods
  navigateToUsers(role?: string) {
    this.router.navigate(['/admin/users'], { queryParams: role ? { role } : {} });
  }

  navigateToSubjects() {
    this.router.navigate(['/admin/subjects']);
  }

  navigateToRequests() {
    this.router.navigate(['/admin/device-requests']);
  }

  navigateToLowAttendance() {
    this.router.navigate(['/admin/low-attendance']);
  }

  // Activity log helpers
  getRoleClass(role: string): string {
    return role.toLowerCase();
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      'Admin': '👑',
      'Faculty': '👨‍🏫',
      'Student': '👨‍🎓'
    };
    return icons[role] || '👤';
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  viewAllActivities() {
    alert('Activity logs viewer coming soon!');
  }

  // Action methods
  sendBulkNotification() {
    const title = prompt('Enter notification title:');
    if (!title) return;

    const message = prompt('Enter notification message:');
    if (!message) return;

    this.adminService.sendBulkNotification({ title, message }).subscribe({
      next: () => alert('Notification sent successfully!'),
      error: (error) => {
        console.error('Failed to send notification:', error);
        alert('Failed to send notification. Check console for details.');
      }
    });
  }

  performMaintenance() {
    const actions = ['Clear Cache', 'Generate Backup', 'Cancel'];
    const choice = prompt(`Select maintenance action:\n1. Clear Cache\n2. Generate Backup\n\nEnter 1 or 2:`);

    switch (choice) {
      case '1':
        this.clearSystemCache();
        break;
      case '2':
        this.generateSystemBackup();
        break;
    }
  }

  clearSystemCache() {
    if (confirm('Are you sure you want to clear the system cache?')) {
      this.adminService.clearCache().subscribe({
        next: () => {
          alert('Cache cleared successfully!');
          this.refreshData();
        },
        error: (error) => {
          console.error('Failed to clear cache:', error);
          alert('Failed to clear cache. Check console for details.');
        }
      });
    }
  }

  generateSystemBackup() {
    if (confirm('Generate a system backup? This may take a few moments.')) {
      this.adminService.generateBackup().subscribe({
        next: () => alert('Backup generated successfully!'),
        error: (error) => {
          console.error('Failed to generate backup:', error);
          alert('Failed to generate backup. Check console for details.');
        }
      });
    }
  }

  exportReport(reportType: 'attendance' | 'users' | 'subjects' | 'low-attendance') {
    this.loading.set(true);
    this.showExportDialog = false;

    this.adminService.exportReport({
      reportType,
      format: 'csv',
      dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      dateTo: new Date()
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.loading.set(false);
        alert('Report exported successfully!');
      },
      error: (error) => {
        console.error('Failed to export report:', error);
        this.loading.set(false);
        alert('Failed to export report. Check console for details.');
      }
    });
  }
}
