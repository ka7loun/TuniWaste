import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImpactMetric } from '../models/impact.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface KpiStat {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export interface DiversionPoint {
  month: string;
  divertedTons: number;
  co2Saved: number;
}

export interface ImpactTrendPoint {
  month: string;
  co2Saved: number;
  waterPreserved: number;
  energyRecovered: number;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getKpiStats(): Observable<KpiStat[]> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    return this.http
      .get<KpiStat[]>(`${environment.apiUrl}/analytics/kpis`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        catchError((error) => {
          console.error('Get KPIs error:', error);
          return of([]);
        })
      );
  }

  getImpactMetrics(): Observable<ImpactMetric[]> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    return this.http
      .get<ImpactMetric[]>(`${environment.apiUrl}/analytics/impact`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        catchError((error) => {
          console.error('Get impact metrics error:', error);
          return of([]);
        })
      );
  }

  getDiversionTrend(): Observable<DiversionPoint[]> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    return this.http
      .get<DiversionPoint[]>(`${environment.apiUrl}/analytics/diversion-trend`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        catchError((error) => {
          console.error('Get diversion trend error:', error);
          return of([]);
        })
      );
  }

  getImpactTrend(): Observable<ImpactTrendPoint[]> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    return this.http
      .get<ImpactTrendPoint[]>(`${environment.apiUrl}/analytics/impact-trend`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        catchError((error) => {
          console.error('Get impact trend error:', error);
          // Fallback: transform diversion trend data if impact-trend endpoint doesn't exist
          return this.getDiversionTrend().pipe(
            catchError(() => of([])),
            map((diversionData) => {
              // Transform diversion data to include water and energy estimates
              return diversionData.map((point) => ({
                month: point.month,
                co2Saved: point.co2Saved,
                waterPreserved: point.divertedTons * 2.5, // Estimate: 2.5L per kg diverted
                energyRecovered: point.divertedTons * 1.8, // Estimate: 1.8 MWh per ton
              }));
            })
          );
        })
      );
  }
}
