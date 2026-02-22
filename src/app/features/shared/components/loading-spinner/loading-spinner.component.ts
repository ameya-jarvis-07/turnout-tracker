import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <div class="spinner-container clay-card">
          <div class="spinner"></div>
          <p class="loading-text">Loading...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(224, 229, 236, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .spinner-container {
      padding: 2rem;
      text-align: center;
      animation: fadeIn 0.3s ease;
    }

    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 1rem;
      border: 4px solid #e0e5ec;
      border-top: 4px solid #7c9cbf;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      margin: 0;
      color: #2d3748;
      font-weight: 600;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class LoadingSpinnerComponent {
  loadingService = inject(LoadingService);
}
