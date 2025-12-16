import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ImpactMetricComponent } from '../../../../shared/components/impact-metric/impact-metric.component';
import {
  AnalyticsService,
  KpiStat,
} from '../../../../core/services/analytics.service';
import { ImpactMetric } from '../../../../core/models/impact.model';

interface FeatureCard {
  title: string;
  body: string;
  icon: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SectionHeadingComponent,
    StatCardComponent,
    ImpactMetricComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  readonly kpis$: Observable<KpiStat[]>;
  readonly impactMetrics$: Observable<ImpactMetric[]>;

  readonly featureCards: FeatureCard[] = [
    {
      title: 'Smart Matching',
      body: 'AI connects waste generators with the most suitable recyclers, optimizing resource recovery and logistics.',
      icon: 'ai',
    },
    {
      title: 'Secure Transactions',
      body: 'Built-in verification, document vault, and compliance tools ensure trusted B2B waste trading.',
      icon: 'shield',
    },
    {
      title: 'Real-time Bidding',
      body: 'Participate in live auctions for waste materials with transparent pricing and instant notifications.',
      icon: 'bid',
    },
    {
      title: 'Impact Tracking',
      body: 'Automated carbon accounting and environmental metrics help you demonstrate ESG commitments.',
      icon: 'impact',
    },
  ];

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.kpis$ = this.analyticsService.getKpiStats();
    this.impactMetrics$ = this.analyticsService.getImpactMetrics();
  }

  ngOnInit(): void {
    // Redirect verified users to dashboard
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (user && user.verified) {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
