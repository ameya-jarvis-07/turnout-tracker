import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar clay-card" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        @if (!collapsed) {
          <h3>Menu</h3>
        }
        <button class="toggle-btn clay-button" (click)="toggleCollapse()">
          {{ collapsed ? '→' : '←' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        @for (item of filteredMenuItems; track item.route) {
          <a 
            [routerLink]="item.route" 
            routerLinkActive="active"
            class="nav-item"
            [title]="item.label">
            <span class="nav-icon">{{ item.icon }}</span>
            @if (!collapsed) {
              <span class="nav-label">{{ item.label }}</span>
            }
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: sticky;
      top: 100px;
      height: calc(100vh - 150px);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      width: 250px;

      &.collapsed {
        width: 80px;

        .sidebar-header h3 {
          display: none;
        }
      }
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(163, 177, 198, 0.2);
      margin-bottom: 1rem;

      h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #2d3748;
      }

      .toggle-btn {
        padding: 0.5rem;
        font-size: 1rem;
        min-height: 36px;
        width: 36px;
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      text-decoration: none;
      color: #2d3748;
      transition: all 0.3s ease;
      font-size: 0.875rem;
      font-weight: 500;
      min-height: 44px;

      &:hover {
        background: rgba(124, 156, 191, 0.1);
        box-shadow: inset 2px 2px 4px rgba(163, 177, 198, 0.3);
      }

      &.active {
        background: linear-gradient(135deg, #7c9cbf, #8b9dc3);
        color: white;
        box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.3);
      }
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #a3b1c6;
      border-radius: 3px;
    }

    @media (max-width: 992px) {
      .sidebar {
        position: fixed;
        left: -250px;
        top: 0;
        height: 100vh;
        z-index: 1000;

        &.show {
          left: 0;
        }
      }
    }
  `]
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() collapsed: boolean = false;

  authService = inject(AuthService);
  router = inject(Router);

  get filteredMenuItems(): MenuItem[] {
    const userRole = this.authService.getUserRole();
    return this.menuItems.filter(item => 
      !item.roles || !userRole || item.roles.includes(userRole)
    );
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}
