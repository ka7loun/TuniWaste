import { Injectable } from '@angular/core';
import { ImpactCalculatorInput, ImpactCalculatorResult } from '../models/impact.model';

const MATERIAL_FACTORS: Record<
  string,
  { co2PerTon: number; diversionMultiplier: number; energyPerTon: number }
> = {
  metals: { co2PerTon: 3.1, diversionMultiplier: 1.2, energyPerTon: 1.6 },
  plastics: { co2PerTon: 2.4, diversionMultiplier: 1.5, energyPerTon: 2.1 },
  organics: { co2PerTon: 1.2, diversionMultiplier: 0.9, energyPerTon: 0.8 },
  chemicals: { co2PerTon: 4.6, diversionMultiplier: 1.1, energyPerTon: 2.8 },
  construction: { co2PerTon: 0.6, diversionMultiplier: 0.7, energyPerTon: 0.4 },
  textiles: { co2PerTon: 1.8, diversionMultiplier: 1.3, energyPerTon: 1.2 },
};

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  calculateImpact(input: ImpactCalculatorInput): ImpactCalculatorResult {
    const factor =
      MATERIAL_FACTORS[input.material] ?? MATERIAL_FACTORS['metals'];
    const transportFactor =
      input.recyclingMethod === 'energy-recovery' ? 0.9 : 1.1;

    const co2Saved = +(input.tons * factor.co2PerTon * transportFactor).toFixed(2);
    const wasteDiverted = +(input.tons * factor.diversionMultiplier).toFixed(2);
    const energySaved = +(
      input.tons *
      factor.energyPerTon *
      (input.recyclingMethod === 'remanufacture' ? 1.3 : 1)
    ).toFixed(2);

    return { co2Saved, wasteDiverted, energySaved };
  }
}
