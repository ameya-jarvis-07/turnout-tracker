import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { LanguageService, SupportedLanguage } from '../../../core/services/language.service';
import { DisplayService } from '../../../core/services/display.service';

interface UserPreferences {
  theme: Theme;
  language: SupportedLanguage;
  emailNotifications: boolean;
  pushNotifications: boolean;
  attendanceReminders: boolean;
  sessionAlerts: boolean;
  compactView: boolean;
  showAnimations: boolean;
  dataSharing: boolean;
  profileVisibility: 'public' | 'private';
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        
        <main class="main-content">
          <div class="page-header">
            <h1>Settings</h1>
            <button class="clay-button" [routerLink]="getDashboardRoute()">
              ← Back to Dashboard
            </button>
          </div>

          <div class="settings-container">
            <!-- Change Password Section -->
            <div class="clay-card settings-card">
              <div class="card-header">
                <h3>🔐 Change Password</h3>
              </div>
              <div class="password-notice">
                <div class="notice-icon">ℹ️</div>
                <div>
                  <p class="notice-title">Password Changes Require Admin Assistance</p>
                  <p class="notice-text">For security reasons, password changes must be requested through your administrator.</p>
                  <p class="notice-text">Please contact your admin at: <strong>admin@attendance.com</strong></p>
                </div>
              </div>
            </div>

            <!-- Update Profile Information -->
            <div class="clay-card settings-card">
              <div class="card-header">
                <h3>👤 Profile Information</h3>
              </div>
              <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
                <div class="form-group">
                  <label for="fullName">Full Name</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    name="fullName"
                    class="clay-input"
                    [(ngModel)]="profileData.fullName"
                    required
                    minlength="3">
                </div>

                <div class="form-group">
                  <label for="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    class="clay-input"
                    [(ngModel)]="profileData.email"
                    required
                    email>
                  <small class="form-hint">This email will be used for all notifications</small>
                </div>

                <div class="form-group">
                  <label>Role</label>
                  <input 
                    type="text" 
                    class="clay-input"
                    [value]="currentUser?.role"
                    disabled>
                  <small class="form-hint">Role cannot be changed</small>
                </div>

                <button 
                  type="submit" 
                  class="clay-button primary"
                  [disabled]="!profileForm.valid || savingProfile()">
                  {{ savingProfile() ? 'Saving...' : 'Save Profile Changes' }}
                </button>
              </form>
            </div>

            <!-- Notification Preferences -->
            <div class="clay-card settings-card">
              <div class="card-header">
                <h3>🔔 Notification Preferences</h3>
              </div>
              <p class="section-description">Manage how you receive notifications and alerts</p>
              
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <label for="emailNotifications">Email Notifications</label>
                    <p>Receive notifications via email</p>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="emailNotifications"
                      [(ngModel)]="preferences.emailNotifications"
                      (change)="savePreferences()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label for="pushNotifications">Push Notifications</label>
                    <p>Receive browser push notifications</p>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="pushNotifications"
                      [(ngModel)]="preferences.pushNotifications"
                      (change)="savePreferences()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label for="attendanceReminders">Attendance Reminders</label>
                    <p>Get reminded when attendance sessions are open</p>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="attendanceReminders"
                      [(ngModel)]="preferences.attendanceReminders"
                      (change)="savePreferences()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label for="sessionAlerts">Session Alerts</label>
                    <p>Receive alerts when sessions open or close</p>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="sessionAlerts"
                      [(ngModel)]="preferences.sessionAlerts"
                      (change)="savePreferences()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Privacy Settings -->
            <div class="clay-card settings-card">
              <div class="card-header">
                <h3>🔒 Privacy Settings</h3>
              </div>
              <p class="section-description">Control your privacy and data sharing preferences</p>
              
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <label for="dataSharing">Anonymous Data Sharing</label>
                    <p>Help improve the system by sharing anonymous usage data</p>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="dataSharing"
                      [(ngModel)]="preferences.dataSharing"
                      (change)="savePreferences()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="form-group">
                  <label for="profileVisibility">Profile Visibility</label>
                  <select 
                    id="profileVisibility" 
                    class="clay-select"
                    [(ngModel)]="preferences.profileVisibility"
                    (change)="savePreferences()">
                    <option value="public">Public - Visible to all users</option>
                    <option value="private">Private - Only visible to admins</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Theme Settings -->
            <div class="clay-card settings-card">
              <div class="card-header">
                <h3>🎨 Theme Settings</h3>
              </div>
              <p class="section-description">Customize the appearance of the application</p>
              
              <div class="form-group">
                <label for="theme">Theme Mode</label>
                <select 
                  id="theme" 
                  class="clay-select"
                  [(ngModel)]="preferences.theme"
                  (change)="applyTheme()">
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="auto">Auto (System Preference)</option>
                </select>
                <small class="form-hint">Current effective theme: {{ themeService.effectiveTheme() }}</small>
              </div>
            </div>

            <!-- Language Preferences -->
            <div class="clay-card settings-card">
              <div class="card-header">
                <h3>🌐 Language Preferences</h3>
              </div>
              <p class="section-description">Choose your preferred language</p>
              
              <div class="form-group">
                <label for="language">Display Language</label>
                <select 
                  id="language" 
                  class="clay-select"
                  [(ngModel)]="preferences.language"
                  (change)="savePreferences()">
                  <option value="en">English</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
                <small class="form-hint">Current: {{ languageService.getLanguageName(preferences.language) }}</small>
              </div>

              <div class="language-demo">
                <p><strong>Preview:</strong></p>
                <p>{{ languageService.translate('app.name') }}</p>
                <p>{{ languageService.translate('app.welcome') }}</p>
              </div>
            </div>

            <!-- Display Options -->
            <div class="clay-card settings-card">
              <div class="card-header">
                <h3>📱 Display Options</h3>
              </div>
              <p class="section-description">Customize how information is displayed</p>
              
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <label for="compactView">Compact View</label>
                    <p>Show more content in less space</p>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="compactView"
                      [(ngModel)]="preferences.compactView"
                      (change)="savePreferences()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <label for="showAnimations">Animations</label>
                    <p>Enable smooth transitions and animations</p>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="showAnimations"
                      [(ngModel)]="preferences.showAnimations"
                      (change)="savePreferences()">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Reset Settings -->
            <div class="clay-card settings-card">
              <div class="card-header">
                <h3>⚠️ Reset Settings</h3>
              </div>
              <p class="section-description">Reset all preferences to default values</p>
              
              <button 
                class="clay-button danger" 
                (click)="resetAllSettings()">
                Reset All Settings to Default
              </button>
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

    .settings-container {
      max-width: 800px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .settings-card {
      padding: 0;
      overflow: hidden;

      .card-header {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(163, 177, 198, 0.2);
        background: linear-gradient(135deg, rgba(124, 156, 191, 0.05), rgba(139, 157, 195, 0.05));

        h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }

      > form,
      > .settings-list,
      > .form-group,
      > button,
      > p.section-description {
        padding: 1.5rem;
        padding-top: 0;
        margin-top: 1.5rem;
      }

      > button.clay-button {
        margin: 1.5rem;
        margin-top: 0;
      }
    }

    .password-notice {
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      background: linear-gradient(135deg, rgba(124, 156, 191, 0.1), rgba(139, 157, 195, 0.1));
      border-radius: 12px;
      margin: 1.5rem;

      .notice-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .notice-title {
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        color: #2d3748;
        font-size: 0.9375rem;
      }

      .notice-text {
        margin: 0.25rem 0;
        color: #718096;
        font-size: 0.875rem;
        line-height: 1.5;

        strong {
          color: #7c9cbf;
        }
      }
    }

    .section-description {
      color: #718096;
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0;
    }

    .form-group {
      margin-bottom: 1.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #2d3748;
        font-weight: 600;
        font-size: 0.875rem;
      }

      .clay-input,
      .clay-select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 12px;
        background: #e8ecf1;
        color: #2d3748;
        font-size: 0.875rem;
        box-shadow: inset 2px 2px 4px rgba(163, 177, 198, 0.3),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.5);
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          box-shadow: inset 3px 3px 6px rgba(163, 177, 198, 0.4),
                      inset -2px -2px 4px rgba(255, 255, 255, 0.5);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .form-hint {
        display: block;
        margin-top: 0.5rem;
        color: #718096;
        font-size: 0.75rem;
        font-style: italic;
      }
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #e8ecf1;
      border-radius: 12px;
      box-shadow: 2px 2px 4px rgba(163, 177, 198, 0.2),
                  -2px -2px 4px rgba(255, 255, 255, 0.5);

      .setting-info {
        flex: 1;

        label {
          display: block;
          margin: 0 0 0.25rem 0;
          color: #2d3748;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
        }

        p {
          margin: 0;
          color: #718096;
          font-size: 0.8125rem;
          line-height: 1.4;
        }
      }
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
      flex-shrink: 0;

      input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked + .toggle-slider {
          background: linear-gradient(135deg, #7c9cbf, #8b9dc3);
        }

        &:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #a3b1c6;
        border-radius: 28px;
        transition: all 0.3s ease;
        box-shadow: inset 2px 2px 4px rgba(163, 177, 198, 0.4),
                    inset -1px -1px 2px rgba(255, 255, 255, 0.3);

        &:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
      }
    }

    button[type="submit"],
    button.clay-button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #e8ecf1;
      color: #2d3748;
      box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.3),
                  -4px -4px 8px rgba(255, 255, 255, 0.5);

      &:hover:not(:disabled) {
        box-shadow: 2px 2px 4px rgba(163, 177, 198, 0.3),
                    -2px -2px 4px rgba(255, 255, 255, 0.5);
        transform: translateY(1px);
      }

      &:active:not(:disabled) {
        box-shadow: inset 2px 2px 4px rgba(163, 177, 198, 0.3),
                    inset -2px -2px 4px rgba(255, 255, 255, 0.5);
      }

      &.primary {
        background: linear-gradient(135deg, #7c9cbf, #8b9dc3);
        color: white;
        box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.4),
                    -2px -2px 4px rgba(255, 255, 255, 0.2);
      }

      &.danger {
        background: linear-gradient(135deg, #ee4266, #dc3758);
        color: white;
        box-shadow: 4px 4px 8px rgba(238, 66, 102, 0.3),
                    -2px -2px 4px rgba(255, 255, 255, 0.2);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .language-demo {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(124, 156, 191, 0.05);
      border-radius: 8px;
      border-left: 3px solid #7c9cbf;

      p {
        margin: 0.25rem 0;
        font-size: 0.875rem;
        color: #2d3748;

        strong {
          color: #7c9cbf;
        }
      }
    }

    @media (max-width: 768px) {
      .dashboard-content {
        flex-direction: column;
      }

      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .settings-container {
        max-width: 100%;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  storageService = inject(StorageService);
  themeService = inject(ThemeService);
  languageService = inject(LanguageService);
  displayService = inject(DisplayService);
  
  currentUser: any = null;
  menuItems: MenuItem[] = [];
  savingProfile = signal(false);

  profileData = {
    fullName: '',
    email: ''
  };

  preferences: UserPreferences = {
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    attendanceReminders: true,
    sessionAlerts: true,
    compactView: false,
    showAnimations: true,
    dataSharing: false,
    profileVisibility: 'public'
  };

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProfileData();
    this.loadPreferences();
    this.setupMenuItems();
  }

  private loadProfileData() {
    if (this.currentUser) {
      this.profileData.fullName = this.currentUser.fullName;
      this.profileData.email = this.currentUser.email;
    }
  }

  private loadPreferences() {
    const saved = localStorage.getItem('user_preferences');
    if (saved) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
    
    // Sync with services
    this.preferences.theme = this.themeService.currentTheme();
    this.preferences.language = this.languageService.currentLanguage();
    this.preferences.compactView = this.displayService.compactView();
    this.preferences.showAnimations = this.displayService.showAnimations();
  }

  savePreferences() {
    localStorage.setItem('user_preferences', JSON.stringify(this.preferences));
    
    // Apply theme
    this.themeService.setTheme(this.preferences.theme);
    
    // Apply language
    this.languageService.setLanguage(this.preferences.language);
    
    // Apply display settings
    this.displayService.setCompactView(this.preferences.compactView);
    this.displayService.setShowAnimations(this.preferences.showAnimations);
    
    this.showToast('Preferences saved successfully');
  }

  updateProfile() {
    if (!this.currentUser) return;

    this.savingProfile.set(true);

    // Simulate API call
    setTimeout(() => {
      // Update current user
      this.currentUser.fullName = this.profileData.fullName;
      this.currentUser.email = this.profileData.email;

      // Update stored user data
      this.storageService.setUser(this.currentUser);
      
      // Update auth service
      this.authService.currentUser.set(this.currentUser);

      this.showToast('Profile updated successfully');
      this.savingProfile.set(false);
    }, 1000);
  }

  applyTheme() {
    this.themeService.setTheme(this.preferences.theme);
    this.savePreferences();
    
    const themeName = this.preferences.theme === 'auto' ? 'Auto (System)' : 
                      this.preferences.theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    this.showToast(`Theme changed to ${themeName}`);
  }

  resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      this.preferences = {
        theme: 'light',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        attendanceReminders: true,
        sessionAlerts: true,
        compactView: false,
        showAnimations: true,
        dataSharing: false,
        profileVisibility: 'public'
      };
      
      localStorage.removeItem('user_preferences');
      
      // Reset services
      this.themeService.setTheme('light');
      this.languageService.setLanguage('en');
      this.displayService.setCompactView(false);
      this.displayService.setShowAnimations(true);
      
      this.showToast('All settings have been reset to default');
    }
  }

  private showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `app-toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '600',
      fontSize: '0.875rem',
      boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.2)',
      zIndex: '10000',
      animation: 'slideIn 0.3s ease',
      maxWidth: '400px',
      wordWrap: 'break-word'
    });

    // Set background color based on type
    if (type === 'success') {
      toast.style.background = 'linear-gradient(135deg, #7bc043, #6aa839)';
    } else if (type === 'info') {
      toast.style.background = 'linear-gradient(135deg, #7c9cbf, #8b9dc3)';
    } else {
      toast.style.background = 'linear-gradient(135deg, #ee4266, #dc3758)';
    }

    // Add animation keyframes if not already present
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Add to DOM
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
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

  getDashboardRoute(): string {
    const role = this.authService.getUserRole();
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Faculty') return '/faculty/dashboard';
    if (role === 'Student') return '/student/dashboard';
    return '/';
  }
}
