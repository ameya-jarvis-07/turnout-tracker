import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
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
            <input type="text" class="clay-input" placeholder="Search users by name or email..." />
          </div>

          @if (filteredUsers().length > 0) {
            <div class="users-list">
              @for (user of filteredUsers(); track user.userId) {
                <div class="user-card clay-card">
                  <div class="user-header">
                    <div>
                      <h3>{{ user.firstName }} {{ user.lastName }}</h3>
                      <p class="user-email">{{ user.email }}</p>
                    </div>
                    <span class="role-badge" [ngClass]="user.role">
                      {{ user.role }}
                    </span>
                  </div>
                  <div class="user-details">
                    <div class="detail">
                      <span class="label">Employee ID:</span>
                      <span>{{ user.employeeId || '-' }}</span>
                    </div>
                    <div class="detail">
                      <span class="label">Status:</span>
                      <span class="status" [class.active]="user.active">
                        {{ user.active ? '✓ Active' : '✕ Inactive' }}
                      </span>
                    </div>
                    <div class="detail">
                      <span class="label">Joined:</span>
                      <span>{{ formatDate(user.createdDate) }}</span>
                    </div>
                  </div>
                  <div class="actions">
                    <button class="clay-button small" (click)="editUser(user.userId)">
                      Edit
                    </button>
                    <button class="clay-button small" [class.danger]="user.active" (click)="toggleUserStatus(user.userId)">
                      {{ user.active ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>No users found</p>
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
  activeRole = signal<string>('all');
  users = signal<any[]>([]);

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
    // Mock data - replace with actual service calls
    this.users.set([
      {
        userId: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        employeeId: 'A001',
        role: 'Admin',
        active: true,
        createdDate: new Date('2024-01-15')
      },
      {
        userId: 2,
        firstName: 'John',
        lastName: 'Teacher',
        email: 'john@example.com',
        employeeId: 'F001',
        role: 'Faculty',
        active: true,
        createdDate: new Date('2024-02-01')
      },
      {
        userId: 3,
        firstName: 'Jane',
        lastName: 'Student',
        email: 'jane@example.com',
        employeeId: 'S001',
        role: 'Student',
        active: true,
        createdDate: new Date('2024-03-01')
      }
    ]);
  }

  filteredUsers() {
    if (this.activeRole() === 'all') {
      return this.users();
    }
    return this.users().filter(u => u.role === this.activeRole());
  }

  getTotalCount() {
    return this.users().length;
  }

  countByRole(role: string) {
    return this.users().filter(u => u.role === role).length;
  }

  editUser(userId: number) {
    alert(`Edit user ${userId}`);
  }

  toggleUserStatus(userId: number) {
    const user = this.users().find(u => u.userId === userId);
    if (user) {
      user.active = !user.active;
      this.users.set([...this.users()]);
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
