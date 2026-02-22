import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DeviceFingerprintService } from '../../../core/services/device-fingerprint.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card clay-card">
        <div class="login-header">
          <h1>Smart Attendance System</h1>
          <p>Sign in to continue</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="clay-input"
              [class.error]="isFieldInvalid('email')"
              placeholder="Enter your email"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-message">
                @if (loginForm.get('email')?.errors?.['required']) {
                  Email is required
                } @else if (loginForm.get('email')?.errors?.['email']) {
                  Please enter a valid email
                }
              </span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="clay-input"
              [class.error]="isFieldInvalid('password')"
              placeholder="Enter your password"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-message">Password is required</span>
            }
          </div>

          <div class="form-group remember-me">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="rememberMe" class="clay-checkbox" />
              <span>Remember me</span>
            </label>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-error">
              {{ errorMessage() }}
            </div>
          }

          @if (deviceChangeRequired()) {
            <div class="alert alert-warning">
              <strong>Device Change Detected!</strong>
              <p>Your device has changed. Please request device change approval from admin.</p>
              <button type="button" class="clay-button" (click)="requestDeviceChange()">
                Request Device Change
              </button>
            </div>
          }

          <button 
            type="submit" 
            class="clay-button primary full-width"
            [disabled]="loading() || loginForm.invalid">
            @if (loading()) {
              <span>Signing in...</span>
            } @else {
              <span>Sign In</span>
            }
          </button>
        </form>

        <div class="login-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Register here</a></p>
        </div>
      </div>

      <div class="device-info clay-card">
        <h4>Device Information</h4>
        <p><strong>Device:</strong> {{ deviceName }}</p>
        <p><strong>Fingerprint:</strong> {{ deviceFingerprint.substring(0, 8) }}...</p>
        <small>This device will be registered for attendance marking</small>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 450px;
      animation: fadeIn 0.5s ease;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0 0 0.5rem 0;
        color: #7c9cbf;
        font-size: 1.75rem;
      }

      p {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
      }
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #2d3748;
        font-size: 0.875rem;
      }

      &.remember-me {
        margin-bottom: 1rem;
      }
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: normal;

      span {
        font-size: 0.875rem;
        color: #2d3748;
      }
    }

    .error-message {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #ee4266;
    }

    .alert {
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;

      &.alert-error {
        background: rgba(238, 66, 102, 0.1);
        color: #ee4266;
        box-shadow: inset 2px 2px 4px rgba(238, 66, 102, 0.2);
      }

      &.alert-warning {
        background: rgba(255, 166, 43, 0.1);
        color: #b87503;
        box-shadow: inset 2px 2px 4px rgba(255, 166, 43, 0.2);

        strong {
          display: block;
          margin-bottom: 0.5rem;
        }

        p {
          margin: 0 0 1rem 0;
        }

        button {
          width: 100%;
        }
      }
    }

    .full-width {
      width: 100%;
    }

    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: #718096;

      a {
        color: #7c9cbf;
        font-weight: 600;
        text-decoration: none;

        &:hover {
          color: #8b9dc3;
        }
      }
    }

    .device-info {
      max-width: 450px;
      width: 100%;

      h4 {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        color: #2d3748;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      p {
        margin: 0.5rem 0;
        font-size: 0.813rem;
        color: #718096;

        strong {
          color: #2d3748;
        }
      }

      small {
        display: block;
        margin-top: 1rem;
        color: #718096;
        font-size: 0.75rem;
        font-style: italic;
      }
    }

    @media (max-width: 576px) {
      .login-container {
        padding: 1rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private deviceService = inject(DeviceFingerprintService);
  private router = inject(Router);

  loginForm!: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  deviceChangeRequired = signal(false);
  deviceFingerprint: string = '';
  deviceName: string = '';

  ngOnInit() {
    this.initForm();
    this.loadDeviceInfo();
  }

  private initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  private async loadDeviceInfo() {
    this.deviceFingerprint = await this.deviceService.getFingerprint();
    this.deviceName = this.deviceService.getDeviceName();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.deviceChangeRequired.set(false);

    try {
      const { email, password } = this.loginForm.value;
      const response = await this.authService.login(email, password);

      if (response.deviceChangeRequired) {
        this.deviceChangeRequired.set(true);
        this.loading.set(false);
        return;
      }

      if (response.success) {
        // Redirect based on user role
        const role = this.authService.getUserRole();
        if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'Faculty') {
          this.router.navigate(['/faculty/dashboard']);
        } else if (role === 'Student') {
          this.router.navigate(['/student/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.errorMessage.set(response.message || 'Login failed');
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'An error occurred during login');
    } finally {
      this.loading.set(false);
    }
  }

  requestDeviceChange() {
    this.router.navigate(['/auth/device-change-request']);
  }
}
