import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card clay-card" [class.clickable]="clickable">
      <div class="stats-icon" [style.background]="iconBackground">
        <span [innerHTML]="icon"></span>
      </div>
      <div class="stats-content">
        <h3 class="stats-title">{{ title }}</h3>
        <div class="stats-value">
          <span class="value" [class.animating]="animate">{{ displayValue }}</span>
          @if (trend) {
            <span class="trend" [class.up]="trend === 'up'" [class.down]="trend === 'down'">
              {{ trend === 'up' ? '↑' : '↓' }} {{ trendValue }}
            </span>
          }
        </div>
        @if (subtitle) {
          <p class="stats-subtitle">{{ subtitle }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .stats-card {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      min-height: 120px;
      transition: all 0.3s ease;

      &.clickable {
        cursor: pointer;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 12px 12px 20px #a3b1c6, -12px -12px 20px #ffffff;
        }
      }
    }

    .stats-icon {
      width: 60px;
      height: 60px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
      box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.3);
    }

    .stats-content {
      flex: 1;
      min-width: 0;
    }

    .stats-title {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: #718096;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stats-value {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      margin-bottom: 0.25rem;

      .value {
        font-size: 2rem;
        font-weight: 700;
        color: #2d3748;
        line-height: 1;

        &.animating {
          animation: countUp 1s ease-out;
        }
      }

      .trend {
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 8px;

        &.up {
          color: #7bc043;
          background: rgba(123, 192, 67, 0.1);
        }

        &.down {
          color: #ee4266;
          background: rgba(238, 66, 102, 0.1);
        }
      }
    }

    .stats-subtitle {
      margin: 0;
      font-size: 0.75rem;
      color: #718096;
    }

    @keyframes countUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .stats-card {
        flex-direction: column;
        text-align: center;
      }

      .stats-value {
        justify-content: center;
      }
    }
  `]
})
export class StatsCardComponent implements OnInit {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = '📊';
  @Input() iconBackground: string = 'linear-gradient(135deg, #7c9cbf, #8b9dc3)';
  @Input() trend?: 'up' | 'down';
  @Input() trendValue?: string;
  @Input() subtitle?: string;
  @Input() clickable: boolean = false;
  @Input() animate: boolean = true;
  @Input() suffix: string = '';
  @Input() prefix: string = '';

  displayValue: string = '';

  ngOnInit() {
    this.updateDisplayValue();
  }

  ngOnChanges() {
    this.updateDisplayValue();
  }

  private updateDisplayValue() {
    if (typeof this.value === 'number') {
      this.displayValue = `${this.prefix}${this.formatNumber(this.value)}${this.suffix}`;
    } else {
      this.displayValue = `${this.prefix}${this.value}${this.suffix}`;
    }
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
