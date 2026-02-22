import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  template: `
    <nav class="navbar clay-card">
      <div class="navbar-container">
        <div class="navbar-brand">
          <h2 class="brand-title">{{ appName }}</h2>
        </div>

        <div class="navbar-menu">
          <app-notification-bell></app-notification-bell>
          
          <div class="user-profile">
            <div class="user-info" (click)="toggleDropdown()">
              <div class="user-avatar">
                {{ getUserInitials() }}
              </div>
              <div class="user-details">
                <span class="user-name">{{ currentUser?.fullName }}</span>
                <span class="user-role">{{ currentUser?.role }}</span>
              </div>
              <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 12 12">
                <path fill="currentColor" d="M6 9L1 4h10z"/>
              </svg>
            </div>

            @if (showDropdown) {
              <div class="dropdown-menu clay-card">
                <a [routerLink]="getDashboardRoute()" class="dropdown-item">
                  <span>Dashboard</span>
                </a>
                <a routerLink="/profile" class="dropdown-item">
                  <span>Profile</span>
                </a>
                <a routerLink="/settings" class="dropdown-item">
                  <span>Settings</span>
                </a>
                <div class="dropdown-divider"></div>
                <button (click)="logout()" class="dropdown-item logout">
                  <span>Logout</span>
                </button>
              </div>
            }
          </div>
        </div>

        <button class="mobile-menu-toggle" (click)="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      margin-bottom: 2rem;
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
    }

    .navbar-brand {
      .brand-title {
        margin: 0;
        font-size: 1.5rem;
        color: #7c9cbf;
        font-weight: 700;
      }
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-profile {
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(124, 156, 191, 0.1);
      }
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c9cbf, #8b9dc3);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      box-shadow: 4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;

      .user-name {
        font-weight: 600;
        color: #2d3748;
        font-size: 0.875rem;
      }

      .user-role {
        font-size: 0.75rem;
        color: #718096;
      }
    }

    .dropdown-icon {
      transition: transform 0.3s ease;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      min-width: 200px;
      padding: 0.5rem;
      animation: slideDown 0.3s ease;
      z-index: 1001;
    }

    .dropdown-item {
      display: block;
      padding: 0.75rem 1rem;
      color: #2d3748;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-size: 0.875rem;

      &:hover {
        background: rgba(124, 156, 191, 0.1);
      }

      &.logout {
        color: #ee4266;
      }
    }

    .dropdown-divider {
      height: 1px;
      background: #a3b1c6;
      margin: 0.5rem 0;
      opacity: 0.3;
    }

    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;

      span {
        width: 24px;
        height: 3px;
        background: #2d3748;
        border-radius: 2px;
        transition: all 0.3s ease;
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
      .user-details {
        display: none;
      }

      .mobile-menu-toggle {
        display: flex;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  @Input() appName: string = 'Smart Attendance';
  
  authService = inject(AuthService);
  router = inject(Router);
  
  currentUser: any = null;
  showDropdown = false;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  getUserInitials(): string {
    if (!this.currentUser?.fullName) return 'U';
    const names = this.currentUser.fullName.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`
      : names[0][0];
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleMobileMenu() {
    // Implement mobile menu toggle
  }

  getDashboardRoute(): string {
    const role = this.authService.getUserRole();
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Faculty') return '/faculty/dashboard';
    if (role === 'Student') return '/student/dashboard';
    return '/';
  }

  logout() {
    this.authService.logout();
  }
}
