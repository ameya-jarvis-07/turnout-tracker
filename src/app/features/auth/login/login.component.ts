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
      <!-- Animated background elements -->
      <div class="animated-line line-1"></div>
      <div class="animated-line line-2"></div>
      <div class="animated-line line-3"></div>
      <div class="animated-circle circle-1"></div>
      <div class="animated-circle circle-2"></div>
      <div class="animated-circle circle-3"></div>
      <div class="animated-blob blob-1"></div>
      <div class="animated-blob blob-2"></div>

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
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 50%, #eef5ff 100%);
    }

    /* Animated background elements */
    .animated-line {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      box-shadow: 0 0 20px rgba(124, 156, 191, 0.4);
    }

    .line-1 {
      width: 400px;
      height: 3px;
      top: 10%;
      left: -200px;
      animation: floatLine1 10s infinite ease-in-out;
      background: linear-gradient(90deg, transparent, rgba(124, 156, 191, 0.8), rgba(217, 70, 239, 0.6), transparent);
    }

    .line-2 {
      width: 350px;
      height: 2.5px;
      top: 50%;
      right: -175px;
      animation: floatLine2 12s infinite ease-in-out;
      transform: rotate(45deg);
      background: linear-gradient(90deg, transparent, rgba(255, 149, 0, 0.7), rgba(124, 156, 191, 0.7), transparent);
    }

    .line-3 {
      width: 380px;
      height: 2px;
      bottom: 20%;
      left: 10%;
      animation: floatLine3 14s infinite ease-in-out;
      transform: rotate(-30deg);
      background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.7), rgba(124, 156, 191, 0.7), transparent);
    }

    .animated-circle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
    }

    .circle-1 {
      width: 180px;
      height: 180px;
      top: 5%;
      right: 5%;
      animation: floatCircle1 15s infinite ease-in-out;
      border: 3px solid rgba(124, 156, 191, 0.5);
      box-shadow: inset 0 0 30px rgba(124, 156, 191, 0.3), 0 0 40px rgba(124, 156, 191, 0.4), 0 0 60px rgba(217, 70, 239, 0.2);
    }

    .circle-2 {
      width: 140px;
      height: 140px;
      bottom: 15%;
      left: 8%;
      animation: floatCircle2 18s infinite ease-in-out;
      border: 2.5px solid rgba(255, 149, 0, 0.6);
      box-shadow: inset 0 0 25px rgba(255, 149, 0, 0.3), 0 0 40px rgba(255, 149, 0, 0.3), 0 0 60px rgba(255, 149, 0, 0.15);
    }

    .circle-3 {
      width: 120px;
      height: 120px;
      top: 60%;
      right: 8%;
      animation: floatCircle3 20s infinite ease-in-out;
      border: 2px solid rgba(52, 211, 153, 0.5);
      box-shadow: inset 0 0 25px rgba(52, 211, 153, 0.25), 0 0 35px rgba(52, 211, 153, 0.3), 0 0 50px rgba(52, 211, 153, 0.15);
    }

    .animated-blob {
      position: absolute;
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      pointer-events: none;
      z-index: 0;
      filter: blur(50px);
    }

    .blob-1 {
      width: 400px;
      height: 400px;
      top: -150px;
      left: -100px;
      animation: floatBlob1 22s infinite ease-in-out;
      background: radial-gradient(circle at 30% 30%, rgba(124, 156, 191, 0.35), rgba(217, 70, 239, 0.2), transparent);
    }

    .blob-2 {
      width: 350px;
      height: 350px;
      bottom: -120px;
      right: -80px;
      animation: floatBlob2 25s infinite ease-in-out;
      background: radial-gradient(circle at 30% 30%, rgba(255, 149, 0, 0.3), rgba(124, 156, 191, 0.15), transparent);
    }

    .login-card {
      width: 100%;
      max-width: 450px;
      animation: fadeIn 0.5s ease;
      position: relative;
      overflow: hidden;
      z-index: 10;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 200%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(124, 156, 191, 0.15),
          rgba(124, 156, 191, 0.3),
          rgba(124, 156, 191, 0.15),
          transparent
        );
        animation: lineSlide 6s infinite;
        pointer-events: none;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 200%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(163, 177, 198, 0.08),
          rgba(163, 177, 198, 0.15),
          rgba(163, 177, 198, 0.08),
          transparent
        );
        animation: lineSlide 8s infinite 1s;
        pointer-events: none;
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;

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
      position: relative;
      z-index: 1;

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
      position: relative;
      z-index: 1;

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
      position: relative;
      z-index: 1;
    }

    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: #718096;
      position: relative;
      z-index: 1;

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
      position: relative;
      z-index: 10;

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

    @keyframes lineSlide {
      0% {
        left: -100%;
      }
      50% {
        left: 100%;
      }
      100% {
        left: 100%;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes floatLine1 {
      0% {
        left: -150px;
        opacity: 0;
      }
      25% {
        opacity: 1;
      }
      75% {
        opacity: 1;
      }
      100% {
        left: calc(100vw + 150px);
        opacity: 0;
      }
    }

    @keyframes floatLine2 {
      0% {
        right: -125px;
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      80% {
        opacity: 1;
      }
      100% {
        right: calc(100vw + 125px);
        opacity: 0;
      }
    }

    @keyframes floatLine3 {
      0% {
        left: 10%;
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      85% {
        opacity: 1;
      }
      100% {
        left: 110%;
        opacity: 0;
      }
    }

    @keyframes floatCircle1 {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 0.6;
      }
      25% {
        transform: translate(20px, -30px) scale(1.05);
        opacity: 0.8;
      }
      50% {
        transform: translate(-20px, 20px) scale(1);
        opacity: 0.7;
      }
      75% {
        transform: translate(30px, 10px) scale(1.08);
        opacity: 0.8;
      }
      100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.6;
      }
    }

    @keyframes floatCircle2 {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 0.55;
      }
      25% {
        transform: translate(-25px, 25px) scale(1.1);
        opacity: 0.75;
      }
      50% {
        transform: translate(15px, -20px) scale(1);
        opacity: 0.65;
      }
      75% {
        transform: translate(-30px, -15px) scale(1.12);
        opacity: 0.75;
      }
      100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.55;
      }
    }

    @keyframes floatCircle3 {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 0.5;
      }
      25% {
        transform: translate(15px, 20px) scale(1.08);
        opacity: 0.7;
      }
      50% {
        transform: translate(-20px, -25px) scale(1);
        opacity: 0.6;
      }
      75% {
        transform: translate(25px, -10px) scale(1.1);
        opacity: 0.7;
      }
      100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.5;
      }
    }

    @keyframes floatBlob1 {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0.55;
      }
      25% {
        transform: translate(30px, -40px) rotate(90deg);
        opacity: 0.75;
      }
      50% {
        transform: translate(-20px, 30px) rotate(180deg);
        opacity: 0.65;
      }
      75% {
        transform: translate(40px, 20px) rotate(270deg);
        opacity: 0.75;
      }
      100% {
        transform: translate(0, 0) rotate(360deg);
        opacity: 0.55;
      }
    }

    @keyframes floatBlob2 {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 0.5;
      }
      25% {
        transform: translate(-35px, 25px) rotate(90deg);
        opacity: 0.7;
      }
      50% {
        transform: translate(25px, -30px) rotate(180deg);
        opacity: 0.6;
      }
      75% {
        transform: translate(-30px, -20px) rotate(270deg);
        opacity: 0.7;
      }
      100% {
        transform: translate(0, 0) rotate(360deg);
        opacity: 0.5;
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
