import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ImpactMetricComponent } from '../../../../shared/components/impact-metric/impact-metric.component';
import {
  AnalyticsService,
  KpiStat,
  DiversionPoint,
} from '../../../../core/services/analytics.service';
import {
  ImpactMetric,
  ImpactCalculatorInput,
  ImpactCalculatorResult,
} from '../../../../core/models/impact.model';
import { EnvironmentService } from '../../../../core/services/environment.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionHeadingComponent,
    StatCardComponent,
    ImpactMetricComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent {
  readonly kpis$: Observable<KpiStat[]>;
  readonly impactMetrics$: Observable<ImpactMetric[]>;
  readonly diversionTrend$: Observable<DiversionPoint[]>;

  calculatorResult?: ImpactCalculatorResult;

  readonly calculatorForm = this.fb.nonNullable.group({
    material: ['metals', Validators.required],
    tons: [10, [Validators.required, Validators.min(1)]],
    distanceKm: [120, [Validators.required, Validators.min(1)]],
    recyclingMethod: ['reuse', Validators.required],
  });

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly environmentService: EnvironmentService,
    private readonly fb: FormBuilder
  ) {
    this.kpis$ = analyticsService.getKpiStats();
    this.impactMetrics$ = analyticsService.getImpactMetrics();
    this.diversionTrend$ = analyticsService.getDiversionTrend();
  }

  calculate(): void {
    if (this.calculatorForm.invalid) {
      this.calculatorForm.markAllAsTouched();
      return;
    }
    const input = this.calculatorForm.getRawValue() as ImpactCalculatorInput;
    this.calculatorResult = this.environmentService.calculateImpact(input);
  }

  getMaxDiverted(trend: DiversionPoint[]): number {
    return Math.max(...trend.map(p => p.divertedTons), 1);
  }

  getLinePath(trend: DiversionPoint[]): string {
    if (trend.length === 0) return '';
    const maxValue = this.getMaxDiverted(trend);
    const chartWidth = 100;
    const chartHeight = 100;
    const padding = 10;
    
    const points = trend.map((point, index) => {
      const x = padding + (index / (trend.length - 1 || 1)) * (chartWidth - 2 * padding);
      const y = chartHeight - padding - (point.divertedTons / maxValue) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }

  getAreaPath(trend: DiversionPoint[]): string {
    if (trend.length === 0) return '';
    const linePath = this.getLinePath(trend);
    const chartWidth = 100;
    const padding = 10;
    const lastX = padding + ((trend.length - 1) / (trend.length - 1 || 1)) * (chartWidth - 2 * padding);
    const bottomY = 90;
    return `${linePath} L ${lastX},${bottomY} L ${padding},${bottomY} Z`;
  }

  getPointX(index: number, total: number): number {
    if (total === 0) return 0;
    const chartWidth = 100;
    const padding = 10;
    if (total === 1) {
      return padding + (chartWidth - 2 * padding) / 2;
    }
    return padding + (index / (total - 1)) * (chartWidth - 2 * padding);
  }

  getPointY(value: number, maxValue: number): number {
    const chartHeight = 100;
    const padding = 10;
    return chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);
  }
}
