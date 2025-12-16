import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, debounceTime, startWith, switchMap, of, map } from 'rxjs';
import { FacilityPin, MapService } from '../../../core/services/map.service';

@Component({
  selector: 'app-map-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './map-panel.component.html',
  styleUrl: './map-panel.component.scss',
})
export class MapPanelComponent implements OnChanges {
  @Input() pins: FacilityPin[] | null = null;
  @Input() title = 'Active facilities & logistics hubs';
  @Input() eyebrow = 'Location intelligence';
  
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  facilities$: Observable<FacilityPin[]>;

  constructor(private readonly mapService: MapService) {
    // Default behavior if no pins provided (e.g. landing page)
    this.facilities$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      switchMap((term) => this.mapService.searchCity(term))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pins'] && this.pins) {
      // If pins are provided, filter them locally based on search
      this.facilities$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(200),
        map(term => {
          if (!term) return this.pins || [];
          return (this.pins || []).filter(p => 
            p.name.toLowerCase().includes(term.toLowerCase())
          );
        })
      );
    }
  }
}
