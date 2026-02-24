import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, MenuItem } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-student-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="dashboard-layout">
      <app-navbar></app-navbar>
      <div class="dashboard-content">
        <app-sidebar [menuItems]="menuItems"></app-sidebar>
        <main class="main-content">
          <div class="page-header">
            <h1>My Reports</h1>
            <p>Review your attendance and performance reports</p>
          </div>

          <div class="reports-grid">
            <div class="report-card clay-card" (click)="generateReport('attendance')">
              <div class="report-icon">📊</div>
              <h3>Overall Attendance</h3>
              <p>Complete attendance statistics across all subjects</p>
              <button class="clay-button full-width">View Report</button>
            </div>

            <div class="report-card clay-card" (click)="generateReport('subjects')">
              <div class="report-icon">📚</div>
              <h3>Subject-wise Report</h3>
              <p>Attendance breakdown for each subject</p>
              <button class="clay-button full-width">View Report</button>
            </div>

            <div class="report-card clay-card" (click)="generateReport('monthly')">
              <div class="report-icon">📅</div>
              <h3>Monthly Report</h3>
              <p>Month-by-month attendance analysis</p>
              <button class="clay-button full-width">View Report</button>
            </div>

            <div class="report-card clay-card" (click)="generateReport('summary')">
              <div class="report-icon">📋</div>
              <h3>Summary Report</h3>
              <p>Quick overview of your attendance status</p>
              <button class="clay-button full-width">View Report</button>
            </div>

            <div class="report-card clay-card" (click)="generateReport('trends')">
              <div class="report-icon">📈</div>
              <h3>Attendance Trends</h3>
              <p>Visualize your attendance patterns</p>
              <button class="clay-button full-width">View Report</button>
            </div>

            <div class="report-card clay-card" (click)="generateReport('export')">
              <div class="report-icon">💾</div>
              <h3>Export Data</h3>
              <p>Download your attendance data as PDF or CSV</p>
              <button class="clay-button full-width">Export</button>
            </div>
          </div>

          @if (selectedReport) {
            <div class="report-details clay-card">
              <div class="report-header">
                <h2>{{ selectedReport }} Report</h2>
                <div class="report-actions">
                  <button class="clay-button secondary" (click)="downloadReport()">
                    📥 Download PDF
                  </button>
                  <button class="clay-button secondary" (click)="shareReport()">
                    📤 Share
                  </button>
                </div>
              </div>
              <div class="report-content">
                <p>Report data for {{ selectedReport }} will be displayed here...</p>
              </div>
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

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .report-card {
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(124, 156, 191, 0.15);
      }

      .report-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
        font-size: 1.125rem;
      }

      p {
        margin: 0 0 1.5rem 0;
        color: #718096;
        font-size: 0.875rem;
      }
    }

    .report-details {
      margin-top: 2rem;
      padding: 2rem;

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        border-bottom: 1px solid rgba(163, 177, 198, 0.2);
        padding-bottom: 1rem;

        h2 {
          margin: 0;
          color: #2d3748;
        }

        .report-actions {
          display: flex;
          gap: 0.75rem;
        }
      }

      .report-content {
        color: #718096;
        min-height: 200px;
      }
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 992px) {
      .dashboard-content {
        flex-direction: column;
      }

      .reports-grid {
        grid-template-columns: 1fr;
      }

      .report-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class StudentReportsComponent implements OnInit {
  selectedReport: string | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/student/dashboard', icon: '🏠' },
    { label: 'Mark Attendance', route: '/student/mark-attendance', icon: '✓' },
    { label: 'My Attendance', route: '/student/my-attendance', icon: '📋' },
    { label: 'Reports', route: '/student/reports', icon: '📊' },
    { label: 'Trends', route: '/student/trends', icon: '📈' }
  ];

  ngOnInit() {
  }

  generateReport(reportType: string) {
    this.selectedReport = reportType.charAt(0).toUpperCase() + reportType.slice(1);
  }

  downloadReport() {
    alert(`Downloading ${this.selectedReport} report as PDF...`);
  }

  shareReport() {
    alert(`Sharing ${this.selectedReport} report...`);
  }
}
