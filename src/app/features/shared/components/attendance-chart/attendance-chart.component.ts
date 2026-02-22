import { Component, Input, OnInit, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-attendance-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container clay-card">
      @if (title) {
        <h3 class="chart-title">{{ title }}</h3>
      }
      <div class="chart-wrapper">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      padding: 1.5rem;
    }

    .chart-title {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      color: #2d3748;
      font-weight: 600;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      width: 100%;
    }

    canvas {
      max-width: 100%;
    }

    @media (max-width: 768px) {
      .chart-wrapper {
        height: 250px;
      }
    }
  `]
})
export class AttendanceChartComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() chartType: ChartType = 'line';
  @Input() title?: string;
  @Input() labels: string[] = [];
  @Input() datasets: any[] = [];
  @Input() options?: any;

  private chart?: Chart;

  ngOnInit() {
    // Initial setup
  }

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  private createChart() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const clayColors = {
      primary: '#7c9cbf',
      secondary: '#8b9dc3',
      success: '#7bc043',
      warning: '#ffa62b',
      danger: '#ee4266',
      background: '#e0e5ec'
    };

    const defaultOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            },
            usePointStyle: true,
            color: '#2d3748'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(224, 229, 236, 0.95)',
          titleColor: '#2d3748',
          bodyColor: '#2d3748',
          borderColor: '#a3b1c6',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true
        }
      },
      scales: this.chartType !== 'doughnut' && this.chartType !== 'pie' ? {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(163, 177, 198, 0.2)'
          },
          ticks: {
            color: '#718096',
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#718096',
            font: {
              size: 11
            }
          }
        }
      } : undefined
    };

    // Apply default colors to datasets if not provided
    const processedDatasets = this.datasets.map((dataset, index) => {
      const colorKeys = Object.keys(clayColors);
      const colorKey = colorKeys[index % colorKeys.length] as keyof typeof clayColors;
      const color = clayColors[colorKey];

      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || this.addAlpha(color, 0.8),
        borderColor: dataset.borderColor || color,
        borderWidth: dataset.borderWidth || 2,
        tension: dataset.tension !== undefined ? dataset.tension : 0.4,
        fill: dataset.fill !== undefined ? dataset.fill : false
      };
    });

    const config: ChartConfiguration = {
      type: this.chartType,
      data: {
        labels: this.labels,
        datasets: processedDatasets
      },
      options: { ...defaultOptions, ...this.options }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart) return;

    this.chart.data.labels = this.labels;
    this.chart.data.datasets = this.datasets;
    this.chart.update();
  }

  private addAlpha(color: string, alpha: number): string {
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
