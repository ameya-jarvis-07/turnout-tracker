import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-device-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>Device Requests</h1>
            <p>Manage and approve device fingerprint requests</p>
          </div>

          <div class="filter-tabs">
            <button class="tab-button" [class.active]="activeTab() === 'pending'" (click)="activeTab.set('pending')">
              <span class="tab-count">{{ countByStatus('pending') }}</span>
              Pending
            </button>
            <button class="tab-button" [class.active]="activeTab() === 'approved'" (click)="activeTab.set('approved')">
              <span class="tab-count">{{ countByStatus('approved') }}</span>
              Approved
            </button>
            <button class="tab-button" [class.active]="activeTab() === 'rejected'" (click)="activeTab.set('rejected')">
              <span class="tab-count">{{ countByStatus('rejected') }}</span>
              Rejected
            </button>
          </div>

          @if (filteredRequests().length > 0) {
            <div class="requests-list">
              @for (request of filteredRequests(); track request.requestId) {
                <div class="request-card clay-card">
                  <div class="request-header">
                    <div>
                      <h3>{{ request.userName }}</h3>
                      <p class="user-email">{{ request.userEmail }}</p>
                    </div>
                    <span class="status-badge" [ngClass]="request.status">
                      {{ request.status | uppercase }}
                    </span>
                  </div>
                  <div class="request-details">
                    <div class="detail">
                      <span class="label">Device:</span>
                      <span>{{ request.deviceInfo }}</span>
                    </div>
                    <div class="detail">
                      <span class="label">Requested:</span>
                      <span>{{ formatDate(request.requestedDate) }}</span>
                    </div>
                  </div>
                  @if (request.status === 'pending') {
                    <div class="actions">
                      <button class="clay-button success" (click)="approveRequest(request.requestId)">
                        ✓ Approve
                      </button>
                      <button class="clay-button danger" (click)="rejectRequest(request.requestId)">
                        ✗ Reject
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="empty-state clay-card">
              <p>No {{ activeTab() }} device requests</p>
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
        position: relative;

        &:hover {
          color: #2d3748;
        }

        &.active {
          color: #7c9cbf;
          border-bottom-color: #7c9cbf;
        }

        .tab-count {
          display: inline-block;
          background: #7c9cbf;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          font-size: 0.75rem;
          margin-right: 0.5rem;
        }
      }
    }

    .requests-list {
      display: grid;
      gap: 1rem;
    }

    .request-card {
      padding: 1.5rem;

      .request-header {
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

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;

          &.pending {
            background: rgba(255, 166, 43, 0.2);
            color: #ff9020;
          }

          &.approved {
            background: rgba(123, 192, 67, 0.2);
            color: #7bc043;
          }

          &.rejected {
            background: rgba(238, 66, 102, 0.2);
            color: #ee4266;
          }
        }
      }

      .request-details {
        margin-bottom: 1.5rem;

        .detail {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;

          .label {
            font-weight: 600;
            color: #2d3748;
            min-width: 100px;
          }

          span {
            color: #718096;
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
    }
  `]
})
export class DeviceRequestsComponent implements OnInit {
  activeTab = signal<'pending' | 'approved' | 'rejected'>('pending');
  requests = signal<any[]>([]);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' },
    { label: 'Subjects', route: '/admin/subjects', icon: '📚' },
    { label: 'Device Requests', route: '/admin/device-requests', icon: '📱' },
    { label: 'Low Attendance', route: '/admin/low-attendance', icon: '⚠️' },
    { label: 'Users', route: '/admin/users', icon: '👥' },
    { label: 'Reports', route: '/admin/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.loadDeviceRequests();
  }

  private loadDeviceRequests() {
    // Mock data - replace with actual service call
    this.requests.set([
      {
        requestId: 1,
        userName: 'John Doe',
        userEmail: 'john@example.com',
        deviceInfo: 'Chrome on Windows',
        requestedDate: new Date(),
        status: 'pending'
      },
      {
        requestId: 2,
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        deviceInfo: 'Safari on MacOS',
        requestedDate: new Date(Date.now() - 86400000),
        status: 'approved'
      }
    ]);
  }

  filteredRequests() {
    return this.requests().filter(r => r.status === this.activeTab());
  }

  countByStatus(status: string) {
    return this.requests().filter(r => r.status === status).length;
  }

  approveRequest(requestId: number) {
    const request = this.requests().find(r => r.requestId === requestId);
    if (request) {
      request.status = 'approved';
      this.requests.set([...this.requests()]);
    }
  }

  rejectRequest(requestId: number) {
    const request = this.requests().find(r => r.requestId === requestId);
    if (request) {
      request.status = 'rejected';
      this.requests.set([...this.requests()]);
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
