export interface ImpactMetric {
  label: string;
  value: string;
  sublabel: string;
  trend: 'up' | 'down' | 'flat';
}

export interface ImpactCalculatorInput {
  material: string;
  tons: number;
  distanceKm: number;
  recyclingMethod: 'reuse' | 'remanufacture' | 'energy-recovery';
}

export interface ImpactCalculatorResult {
  co2Saved: number;
  wasteDiverted: number;
  energySaved: number;
}

