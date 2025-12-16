import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ImpactMetric } from '../../../core/models/impact.model';

@Component({
  selector: 'app-impact-metric',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './impact-metric.component.html',
  styleUrl: './impact-metric.component.scss',
})
export class ImpactMetricComponent {
  @Input() metric!: ImpactMetric;
}
