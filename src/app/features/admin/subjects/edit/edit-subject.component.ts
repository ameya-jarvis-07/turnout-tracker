import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../../shared/components/sidebar/sidebar.component';
import { SubjectService } from '../../../shared/services/subject.service';

@Component({
  selector: 'app-edit-subject',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>Edit Subject</h1>
            <p>Update subject information</p>
          </div>

          @if (!isLoading) {
            <form [formGroup]="subjectForm" (ngSubmit)="onSubmit()" class="form-container clay-card">
              <div class="form-section">
                <h2>Subject Information</h2>

                <div class="form-group">
                  <label for="subjectCode">Subject Code *</label>
                  <input
                    id="subjectCode"
                    type="text"
                    class="clay-input"
                    formControlName="subjectCode"
                    placeholder="e.g., CS101, MATH202"
                    [class.error]="isFieldInvalid('subjectCode')" />
                  @if (isFieldInvalid('subjectCode')) {
                    <span class="error-message">
                      @if (subjectForm.get('subjectCode')?.hasError('required')) {
                        Subject code is required
                      } @else if (subjectForm.get('subjectCode')?.hasError('minlength')) {
                        Subject code must be at least 3 characters
                      } @else if (subjectForm.get('subjectCode')?.hasError('maxlength')) {
                        Subject code cannot exceed 20 characters
                      }
                    </span>
                  }
                </div>

                <div class="form-group">
                  <label for="subjectName">Subject Name *</label>
                  <input
                    id="subjectName"
                    type="text"
                    class="clay-input"
                    formControlName="subjectName"
                    placeholder="e.g., Introduction to Computer Science"
                    [class.error]="isFieldInvalid('subjectName')" />
                  @if (isFieldInvalid('subjectName')) {
                    <span class="error-message">
                      @if (subjectForm.get('subjectName')?.hasError('required')) {
                        Subject name is required
                      } @else if (subjectForm.get('subjectName')?.hasError('minlength')) {
                        Subject name must be at least 5 characters
                      }
                    </span>
                  }
                </div>

                <div class="form-group">
                  <label for="description">Description</label>
                  <textarea
                    id="description"
                    class="clay-input"
                    formControlName="description"
                    placeholder="Brief description of the subject (optional)"
                    rows="4"></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="credits">Credits *</label>
                    <input
                      id="credits"
                      type="number"
                      class="clay-input"
                      formControlName="credits"
                      min="1"
                      max="10"
                      [class.error]="isFieldInvalid('credits')" />
                    @if (isFieldInvalid('credits')) {
                      <span class="error-message">Credits must be between 1 and 10</span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="semester">Semester *</label>
                    <select class="clay-input" id="semester" formControlName="semester" [class.error]="isFieldInvalid('semester')">
                      <option value="">-- Select Semester --</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                    @if (isFieldInvalid('semester')) {
                      <span class="error-message">Semester is required</span>
                    }
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h2>Availability</h2>

                <div class="form-group checkbox">
                  <input
                    id="isActive"
                    type="checkbox"
                    formControlName="isActive"
                    class="clay-checkbox" />
                  <label for="isActive">Subject is Active</label>
                </div>

                <div class="form-group checkbox">
                  <input
                    id="isElective"
                    type="checkbox"
                    formControlName="isElective"
                    class="clay-checkbox" />
                  <label for="isElective">Elective Subject</label>
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="clay-button primary"
                  [disabled]="!subjectForm.valid || isSubmitting">
                  @if (isSubmitting) {
                    <span>Updating Subject...</span>
                  } @else {
                    <span>✓ Update Subject</span>
                  }
                </button>
                <button type="button" class="clay-button danger" (click)="onDelete()">
                  🗑️ Delete Subject
                </button>
                <button type="button" class="clay-button secondary" (click)="onCancel()">
                  Cancel
                </button>
              </div>
            </form>
          } @else {
            <div class="loading-state clay-card">
              <p>Loading subject details...</p>
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

    .form-container {
      max-width: 700px;
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 1.5rem 0;
        color: #2d3748;
        font-size: 1.125rem;
        border-bottom: 2px solid rgba(124, 156, 191, 0.2);
        padding-bottom: 0.75rem;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-group {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 600;
        color: #2d3748;
        font-size: 0.875rem;
      }

      input, select, textarea {
        padding: 0.75rem;
        border: 1px solid rgba(163, 177, 198, 0.3);
        border-radius: 8px;
        font-size: 0.875rem;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: #7c9cbf;
          box-shadow: inset 0 0 0 2px rgba(124, 156, 191, 0.1);
        }

        &.error {
          border-color: #ee4266;
          box-shadow: inset 0 0 0 2px rgba(238, 66, 102, 0.1);
        }
      }

      textarea {
        resize: vertical;
        min-height: 100px;
      }

      &.checkbox {
        flex-direction: row;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;

        input {
          margin: 0;
          width: auto;
        }

        label {
          margin: 0;
        }
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .error-message {
      color: #ee4266;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(163, 177, 198, 0.2);

      button {
        flex: 1;

        &:last-child {
          flex: 0.5;
        }
      }
    }

    .loading-state {
      padding: 2rem;
      text-align: center;
      color: #718096;
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;

        button {
          flex: 1 !important;
        }
      }
    }
  `]
})
export class EditSubjectComponent implements OnInit {
  private fb = inject(FormBuilder);
  private subjectService = inject(SubjectService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  subjectForm!: FormGroup;
  isSubmitting = false;
  isLoading = true;
  subjectId: number | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' },
    { label: 'Subjects', route: '/admin/subjects', icon: '📚' },
    { label: 'Device Requests', route: '/admin/device-requests', icon: '📱' },
    { label: 'Low Attendance', route: '/admin/low-attendance', icon: '⚠️' },
    { label: 'Users', route: '/admin/users', icon: '👥' },
    { label: 'Reports', route: '/admin/reports', icon: '📊' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.route.params.subscribe(params => {
      this.subjectId = parseInt(params['id']);
      if (this.subjectId) {
        this.loadSubjectDetails();
      }
    });
  }

  private initializeForm() {
    this.subjectForm = this.fb.group({
      subjectCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      subjectName: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      credits: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      semester: ['', Validators.required],
      isActive: [true],
      isElective: [false]
    });
  }

  private loadSubjectDetails() {
    if (!this.subjectId) return;

    this.subjectService.getSubjectById(this.subjectId).subscribe({
      next: (subject: any) => {
        this.subjectForm.patchValue(subject);
        this.isLoading = false;
      },
      error: (error: any) => {
        alert('Failed to load subject details');
        this.router.navigate(['/admin/subjects']);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.subjectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (!this.subjectForm.valid) {
      Object.keys(this.subjectForm.controls).forEach(key => {
        this.subjectForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.subjectId) return;

    this.isSubmitting = true;
    const formValue = this.subjectForm.value;

    this.subjectService.updateSubject(this.subjectId, formValue).subscribe({
      next: () => {
        alert('Subject updated successfully!');
        this.router.navigate(['/admin/subjects']);
      },
      error: (error: any) => {
        alert('Failed to update subject. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  onDelete() {
    if (!this.subjectId) return;

    if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      return;
    }

    this.isSubmitting = true;
    this.subjectService.deleteSubject(this.subjectId).subscribe({
      next: () => {
        alert('Subject deleted successfully!');
        this.router.navigate(['/admin/subjects']);
      },
      error: (error: any) => {
        alert('Failed to delete subject. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/subjects']);
  }
}
