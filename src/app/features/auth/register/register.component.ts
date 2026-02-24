import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card clay-card">
        <div class="register-header">
          <h1>Create Account</h1>
          <p>Join the Smart Attendance System</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              formControlName="fullName"
              class="clay-input"
              [class.error]="isFieldInvalid('fullName')"
              placeholder="Enter your full name"
            />
            @if (isFieldInvalid('fullName')) {
              <span class="error-message">Full name is required</span>
            }
          </div>

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
                @if (registerForm.get('email')?.errors?.['required']) {
                  Email is required
                } @else if (registerForm.get('email')?.errors?.['email']) {
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
              placeholder="Create a password"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-message">
                Password must be at least 6 characters
              </span>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="clay-input"
              [class.error]="isFieldInvalid('confirmPassword') || hasPasswordMismatch()"
              placeholder="Confirm your password"
            />
            @if (hasPasswordMismatch()) {
              <span class="error-message">Passwords do not match</span>
            }
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select
              id="role"
              formControlName="role"
              class="clay-select"
              [class.error]="isFieldInvalid('role')"
            >
              <option value="">Select your role</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Admin">Admin</option>
            </select>
            @if (isFieldInvalid('role')) {
              <span class="error-message">Please select a role</span>
            }
          </div>

          @if (successMessage()) {
            <div class="alert alert-success">
              {{ successMessage() }}
            </div>
          }

          @if (errorMessage()) {
            <div class="alert alert-error">
              {{ errorMessage() }}
            </div>
          }

          <button 
            type="submit" 
            class="clay-button primary full-width"
            [disabled]="loading() || registerForm.invalid">
            @if (loading()) {
              <span>Creating Account...</span>
            } @else {
              <span>Register</span>
            }
          </button>
        </form>

        <div class="register-footer">
          <p>Already have an account? <a routerLink="/auth/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .register-card {
      width: 100%;
      max-width: 500px;
      animation: fadeIn 0.5s ease;
    }

    .register-header {
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

      &.alert-success {
        background: rgba(123, 192, 67, 0.1);
        color: #7bc043;
        box-shadow: inset 2px 2px 4px rgba(123, 192, 67, 0.2);
      }
    }

    .full-width {
      width: 100%;
    }

    .register-footer {
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

    @media (max-width: 576px) {
      .register-container {
        padding: 1rem;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  hasPasswordMismatch(): boolean {
    const password = this.registerForm.get('password');
    const confirmPassword = this.registerForm.get('confirmPassword');
    
    if (!confirmPassword?.touched) return false;
    
    return password?.value !== confirmPassword?.value;
  }

  onSubmit() {
    if (this.registerForm.invalid || this.hasPasswordMismatch()) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { fullName, email, password, role } = this.registerForm.value;

    this.authService.register({ fullName, email, password, role }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set('Registration successful! Redirecting to login...');
        
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message || 'Registration failed. Please try again.');
      }
    });
  }
}
