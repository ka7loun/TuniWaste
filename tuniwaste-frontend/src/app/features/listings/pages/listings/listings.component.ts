import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService, AuthUser } from '../../../../core/services/auth.service';
import { ListingCardComponent } from '../../../../shared/components/listing-card/listing-card.component';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { WasteListing, MaterialCategory } from '../../../../core/models/waste-listing.model';
import { WasteService } from '../../../../core/services/waste.service';
import { MapPanelComponent } from '../../../../shared/components/map-panel/map-panel.component';
import { FacilityPin } from '../../../../core/services/map.service';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ListingCardComponent,
    SectionHeadingComponent,
    MapPanelComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss',
})
export class ListingsComponent {
  readonly user$: Observable<AuthUser | null>;
  readonly isSeller$: Observable<boolean>;
  readonly isBuyer$: Observable<boolean>;
  readonly categories: (MaterialCategory | 'all')[] = ['all', ...this.wasteService.categories];
  readonly myListings$: Observable<WasteListing[]>;
  readonly availableListings$: Observable<WasteListing[]>;
  readonly mapPins$: Observable<FacilityPin[]>;
  loading = true;

  readonly filters = this.fb.group({
    category: ['all' as MaterialCategory | 'all'],
    minQuantity: [0],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly wasteService: WasteService,
    private readonly authService: AuthService
  ) {
    this.user$ = this.authService.user$;
    this.isSeller$ = this.authService.user$.pipe(
      map((user) => user?.role === 'generator' || false)
    );
    this.isBuyer$ = this.authService.user$.pipe(
      map((user) => user?.role === 'buyer' || false)
    );

    // Seller: Show their own listings
    this.myListings$ = combineLatest([
      this.authService.user$,
      this.wasteService.listings$
    ]).pipe(
      map(([user, listings]: [AuthUser | null, WasteListing[]]) => {
        if (!user || user.role !== 'generator') return [];
        return listings.filter((l: WasteListing) => l.seller === user.company || l.seller.includes(user.company));
      })
    );

    // Buyer: Show all available listings with filters
    this.availableListings$ = combineLatest([
      this.wasteService.listings$,
      this.filters.valueChanges
    ]).pipe(
      map(([listings, filters]: [WasteListing[], Partial<{ category: MaterialCategory | 'all' | null; minQuantity: number | null }>]) => {
        let filtered = listings.filter((l: WasteListing) => l.status === 'open');
        
        if (filters.category && filters.category !== 'all') {
          filtered = filtered.filter((l: WasteListing) => l.category === filters.category);
        }
        if (filters.minQuantity && filters.minQuantity > 0) {
          filtered = filtered.filter((l: WasteListing) => l.quantityTons >= (filters.minQuantity || 0));
        }
        
        return filtered;
      })
    );

    // Map listings to pins for the map view
    this.mapPins$ = this.availableListings$.pipe(
      map(listings => listings.map(l => ({
        name: l.title,
        coords: l.coords,
        status: 'available',
        capacity: `${l.quantityTons}t`
      } as FacilityPin)))
    );

    // Initialize filters
    this.filters.patchValue({ category: 'all', minQuantity: 0 });

    // Track loading state
    this.wasteService.listings$.subscribe(() => {
      this.loading = false;
    });
  }
}
