import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface FacilityPin {
  name: string;
  coords: [number, number];
  status: 'available' | 'busy';
  capacity: string;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly facilities: FacilityPin[] = [
    { name: 'Tunis Sorting Hub', coords: [36.8328, 10.2389], status: 'available', capacity: '150 t/week' },
    { name: 'Sfax Recovery Park', coords: [34.7652, 10.7603], status: 'busy', capacity: '200 t/week' },
    { name: 'Gabès Industrial Port', coords: [33.8815, 10.0982], status: 'available', capacity: '90 t/week' },
    { name: 'Bizerte Metals Center', coords: [37.2864, 9.8739], status: 'busy', capacity: '110 t/week' },
  ];

  getFacilities(): Observable<FacilityPin[]> {
    return of(this.facilities);
  }

  searchCity(term: string): Observable<FacilityPin[]> {
    if (!term) {
      return this.getFacilities();
    }
    return of(
      this.facilities.filter((facility) =>
        facility.name.toLowerCase().includes(term.toLowerCase())
      )
    );
  }

  estimateRouteDistance(
    origin: [number, number],
    destination: [number, number]
  ): Observable<number> {
    const [lat1, lon1] = origin;
    const [lat2, lon2] = destination;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return of(Math.round(R * c));
  }
}
