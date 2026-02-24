import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../shared/services/admin.service';
import { UserDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>User Management</h1>
            <p>Manage system users and their roles</p>
          </div>

          <div class="filter-tabs">
            <button class="tab-button" [class.active]="activeRole() === 'all'" (click)="activeRole.set('all')">
              All Users ({{ getTotalCount() }})
            </button>
            <button class="tab-button" [class.active]="activeRole() === 'Admin'" (click)="activeRole.set('Admin')">
              Admins ({{ countByRole('Admin') }})
            </button>
            <button class="tab-button" [class.active]="activeRole() === 'Faculty'" (click)="activeRole.set('Faculty')">
              Faculty ({{ countByRole('Faculty') }})
            </button>
            <button class="tab-button" [class.active]="activeRole() === 'Student'" (click)="activeRole.set('Student')">
              Students ({{ countByRole('Student') }})
            </button>
          </div>

          <div class="search-section clay-card">
            <div class="search-wrapper">
              <input 
                type="text" 
                class="clay-input" 
                placeholder="Search users by name or email..." 
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()" />
              @if (loading()) {
                <span class="loading-indicator">Loading...</span>
              }
            </div>
          </div>

          @if (loading()) {
            <div class="loading-state clay-card">
              <div class="spinner"></div>
              <p>Loading users...</p>
            </div>
          } @else if (filteredUsers().length > 0) {
            <div class="users-list">
              @for (user of filteredUsers(); track user.userId) {
                <div class="user-card clay-card">
                  <div class="user-header">
                    <div>
                      <h3>{{ user.fullName }}</h3>
                      <p class="user-email">{{ user.email }}</p>
                    </div>
                    <span class="role-badge" [ngClass]="user.role">
                      {{ user.role }}
                    </span>
                  </div>
                  <div class="user-details">
                    <div class="detail">
                      <span class="label">User ID:</span>
                      <span>{{ user.userId }}</span>
                    </div>
                    <div class="detail">
                      <span class="label">Device ID:</span>
                      <span>{{ user.registeredDeviceId || 'Not registered' }}</span>
                    </div>
                    <div class="detail">
                      <span class="label">Joined:</span>
                      <span>{{ formatDate(user.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="actions">
                    <button class="clay-button small" (click)="viewUserDetails(user.userId)">
                      View Details
                    </button>
                    <button class="clay-button small secondary" (click)="resetPassword(user.userId)">
                      Reset Password
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state clay-card">
              <div class="empty-icon">👥</div>
              <p>No users found matching your search</p>
              @if (searchQuery) {
                <button class="clay-button" (click)="clearSearch()">Clear Search</button>
              }
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

    .search-section {
      margin-bottom: 2rem;
      padding: 1rem;

      .search-wrapper {
        display: flex;
        align-items: center;
        gap: 1rem;

        input {
          flex: 1;
        }

        .loading-indicator {
          color: #718096;
          font-size: 0.875rem;
        }
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top-color: var(--primary-color, #667eea);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      p {
        color: #718096;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .users-list {
      display: grid;
      gap: 1rem;
    }

    .user-card {
      padding: 1.5rem;

      .user-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 1rem;

        h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.125rem;
        }

        .user-email {
          margin: 0.25rem 0 0 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;

          &.Admin {
            background: rgba(124, 156, 191, 0.2);
            color: #7c9cbf;
          }

          &.Faculty {
            background: rgba(123, 192, 67, 0.2);
            color: #7bc043;
          }

          &.Student {
            background: rgba(255, 166, 43, 0.2);
            color: #ff9020;
          }
        }
      }

      .user-details {
        margin-bottom: 1rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;

        .detail {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;

          .label {
            font-weight: 600;
            color: #2d3748;
            min-width: 100px;
          }

          span {
            color: #718096;

            &.status {
              &.active {
                color: #7bc043;
              }
            }
          }
        }
      }

      .actions {
        display: flex;
        gap: 0.75rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #718096;

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      p {
        margin-bottom: 1rem;
      }
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .user-card .user-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  private adminService = inject(AdminService);

  activeRole = signal<string>('all');
  users = signal<UserDto[]>([]);
  loading = signal(true);
  searchQuery = '';

  // Computed filtered users based on role and search
  filteredUsers = computed(() => {
    let filtered = this.users();

    // Filter by role
    if (this.activeRole() !== 'all') {
      filtered = filtered.filter(u => u.role === this.activeRole());
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.fullName.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' },
    { label: 'Subjects', route: '/admin/subjects', icon: '📚' },
    { label: 'Device Requests', route: '/admin/device-requests', icon: '📱' },
    { label: 'Low Attendance', route: '/admin/low-attendance', icon: '⚠️' },
    { label: 'Users', route: '/admin/users', icon: '👥' },
    { label: 'Reports', route: '/admin/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.loading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
        // Show error message to user
        alert('Failed to load users. Please try again later.');
      }
    });
  }

  getTotalCount() {
    return this.users().length;
  }

  countByRole(role: string) {
    return this.users().filter(u => u.role === role).length;
  }

  onSearchInput() {
    // Trigger change detection - computed signal will automatically update
  }

  clearSearch() {
    this.searchQuery = '';
  }

  viewUserDetails(userId: number) {
    console.log('View user details:', userId);
    // In production, navigate to user detail page or open modal
    this.adminService.getUserById(userId).subscribe({
      next: (user) => {
        alert(`User Details:\n\nName: ${user.fullName}\nEmail: ${user.email}\nRole: ${user.role}\nUser ID: ${user.userId}\nDevice ID: ${user.registeredDeviceId || 'Not registered'}\nJoined: ${this.formatDate(user.createdAt)}`);
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        alert('Failed to load user details.');
      }
    });
  }

  resetPassword(userId: number) {
    if (confirm('Are you sure you want to reset this user\'s password? They will receive an email with reset instructions.')) {
      this.adminService.resetUserPassword(userId).subscribe({
        next: () => {
          alert('Password reset email sent successfully!');
        },
        error: (error) => {
          console.error('Error resetting password:', error);
          alert('Failed to reset password. Please try again.');
        }
      });
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
