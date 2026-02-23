import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        
        <main class="main-content">
          <div class="page-header">
            <h1>My Profile</h1>
            <button class="clay-button" [routerLink]="getDashboardRoute()">
              ← Back to Dashboard
            </button>
          </div>

          <div class="profile-container">
            <div class="clay-card profile-card">
              <div class="profile-header">
                <div class="user-avatar-large">
                  {{ getUserInitials() }}
                </div>
                <div class="user-info">
                  <h2>{{ currentUser?.fullName }}</h2>
                  <p class="user-email">{{ currentUser?.email }}</p>
                  <span class="role-badge">{{ currentUser?.role }}</span>
                </div>
              </div>

              <div class="profile-details">
                <h3>Profile Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Full Name</span>
                  <span class="detail-value">{{ currentUser?.fullName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ currentUser?.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Role</span>
                  <span class="detail-value">{{ currentUser?.role }}</span>
                </div>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0;
        color: #2d3748;
        font-size: 2rem;
      }
    }

    .profile-container {
      max-width: 800px;
    }

    .profile-card {
      padding: 2rem;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(163, 177, 198, 0.2);
      margin-bottom: 2rem;

      .user-avatar-large {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7c9cbf, #8b9dc3);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 2rem;
        box-shadow: 4px 4px 12px #a3b1c6, -4px -4px 12px #ffffff;
        flex-shrink: 0;
      }

      .user-info {
        flex: 1;

        h2 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 1.75rem;
        }

        .user-email {
          margin: 0 0 1rem 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .role-badge {
          display: inline-block;
          padding: 0.375rem 0.875rem;
          background: linear-gradient(135deg, #7c9cbf, #8b9dc3);
          color: white;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }

    .profile-details {
      h3 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.25rem;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 1rem 0;
        border-bottom: 1px solid rgba(163, 177, 198, 0.1);

        &:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: #718096;
          font-size: 0.875rem;
        }

        .detail-value {
          color: #2d3748;
          font-size: 0.875rem;
        }
      }
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  
  currentUser: any = null;
  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.setupMenuItems();
  }

  private setupMenuItems() {
    const role = this.authService.getUserRole();
    
    if (role === 'Admin') {
      this.menuItems = [
        { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' },
        { label: 'Subjects', route: '/admin/subjects', icon: '📚' },
        { label: 'Device Requests', route: '/admin/device-requests', icon: '📱' },
        { label: 'Low Attendance', route: '/admin/low-attendance', icon: '⚠️' },
        { label: 'Users', route: '/admin/users', icon: '👥' },
        { label: 'Reports', route: '/admin/reports', icon: '📊' }
      ];
    } else if (role === 'Faculty') {
      this.menuItems = [
        { label: 'Dashboard', route: '/faculty/dashboard', icon: '🏠' },
        { label: 'My Subjects', route: '/faculty/my-subjects', icon: '📚' },
        { label: 'Open Session', route: '/faculty/open-session', icon: '🚀' },
        { label: 'Session History', route: '/faculty/session-history', icon: '📜' },
        { label: 'Reports', route: '/faculty/reports', icon: '📊' }
      ];
    } else if (role === 'Student') {
      this.menuItems = [
        { label: 'Dashboard', route: '/student/dashboard', icon: '🏠' },
        { label: 'Mark Attendance', route: '/student/mark-attendance', icon: '✓' },
        { label: 'My Attendance', route: '/student/my-attendance', icon: '📋' },
        { label: 'Reports', route: '/student/reports', icon: '📊' },
        { label: 'Trends', route: '/student/trends', icon: '📈' }
      ];
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.fullName) return 'U';
    const names = this.currentUser.fullName.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`
      : names[0][0];
  }

  getDashboardRoute(): string {
    const role = this.authService.getUserRole();
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Faculty') return '/faculty/dashboard';
    if (role === 'Student') return '/student/dashboard';
    return '/';
  }
}
