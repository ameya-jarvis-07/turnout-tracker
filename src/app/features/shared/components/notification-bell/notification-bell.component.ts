import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationDto } from '../../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notification-bell">
      <button class="bell-button clay-button" (click)="toggleDropdown()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        @if (notificationService.unreadCount() > 0) {
          <span class="badge">{{ notificationService.unreadCount() }}</span>
        }
      </button>

      @if (showDropdown) {
        <div class="notification-dropdown clay-card">
          <div class="dropdown-header">
            <h3>Notifications</h3>
            @if (notificationService.unreadCount() > 0) {
              <button class="mark-all-read" (click)="markAllAsRead()">
                Mark all as read
              </button>
            }
          </div>

          <div class="notification-list">
            @if (notificationService.notifications().length === 0) {
              <div class="empty-state">
                <p>No notifications</p>
              </div>
            } @else {
              @for (notification of notificationService.notifications(); track notification.notificationId) {
                <div class="notification-item" 
                     [class.unread]="!notification.isRead"
                     (click)="markAsRead(notification.notificationId)">
                  <div class="notification-content">
                    <p class="notification-message">{{ notification.message }}</p>
                    <span class="notification-time">
                      {{ formatTime(notification.createdAt) }}
                    </span>
                  </div>
                  @if (!notification.isRead) {
                    <span class="unread-indicator"></span>
                  }
                </div>
              }
            }
          </div>

          <div class="dropdown-footer">
            <a routerLink="/notifications" class="view-all">View all notifications</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-bell {
      position: relative;
    }

    .bell-button {
      position: relative;
      padding: 0.5rem;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      svg {
        color: #2d3748;
      }
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ee4266;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 0.625rem;
      font-weight: 700;
      min-width: 18px;
      text-align: center;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .notification-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 360px;
      max-height: 500px;
      display: flex;
      flex-direction: column;
      animation: slideDown 0.3s ease;
      z-index: 1001;
      padding: 0;
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid rgba(163, 177, 198, 0.2);

      h3 {
        margin: 0;
        font-size: 1rem;
        color: #2d3748;
      }

      .mark-all-read {
        background: none;
        border: none;
        color: #7c9cbf;
        font-size: 0.75rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(124, 156, 191, 0.1);
        }
      }
    }

    .notification-list {
      flex: 1;
      overflow-y: auto;
      max-height: 350px;
    }

    .notification-item {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border-bottom: 1px solid rgba(163, 177, 198, 0.1);

      &:hover {
        background: rgba(124, 156, 191, 0.05);
      }

      &.unread {
        background: rgba(124, 156, 191, 0.08);
      }
    }

    .notification-content {
      flex: 1;

      .notification-message {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        color: #2d3748;
        line-height: 1.4;
      }

      .notification-time {
        font-size: 0.75rem;
        color: #718096;
      }
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      background: #7c9cbf;
      border-radius: 50%;
      margin-top: 0.5rem;
      box-shadow: 0 0 4px rgba(124, 156, 191, 0.5);
    }

    .empty-state {
      padding: 2rem;
      text-align: center;

      p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
      }
    }

    .dropdown-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid rgba(163, 177, 198, 0.2);
      text-align: center;

      .view-all {
        color: #7c9cbf;
        font-size: 0.875rem;
        font-weight: 600;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #8b9dc3;
        }
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .notification-dropdown {
        width: 320px;
        right: -50px;
      }
    }
  `]
})
export class NotificationBellComponent implements OnInit {
  notificationService = inject(NotificationService);
  showDropdown = false;

  ngOnInit() {
    this.notificationService.refreshNotifications();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.notificationService.getNotifications().subscribe();
    }
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  formatTime(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notificationDate.toLocaleDateString();
  }
}
