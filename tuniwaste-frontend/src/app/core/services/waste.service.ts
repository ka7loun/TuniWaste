import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import {
  ListingFilter,
  MaterialCategory,
  WasteListing,
} from '../models/waste-listing.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Helper function to get file URL
function getFileUrl(path: string): string {
  if (!path || path.trim() === '') {
    console.log('getFileUrl: Empty path provided');
    return '';
  }
  
  console.log('getFileUrl: Input path =', path);
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('getFileUrl: Already a full URL, returning as-is');
    return path;
  }
  
  // Extract filename if it's a path
  let filename = path;
  if (path.includes('/')) {
    filename = path.split('/').pop() || path;
  }
  
  // Remove any leading/trailing slashes or spaces
  filename = filename.trim().replace(/^\/+|\/+$/g, '');
  
  if (!filename) {
    console.log('getFileUrl: No filename extracted');
    return '';
  }
  
  // Construct the URL - backend serves files at /uploads/ (not /api/uploads/)
  // The response path from upload is /uploads/filename, so we use the base URL + /uploads/
  const baseUrl = environment.apiUrl.replace('/api', '');
  const finalUrl = `${baseUrl}/uploads/${filename}`;
  
  console.log('getFileUrl: Final URL =', finalUrl);
  console.log('getFileUrl: Base URL =', baseUrl, 'API URL =', environment.apiUrl, 'Filename =', filename);
  
  return finalUrl;
}

interface BackendListing {
  _id: string;
  title: string;
  material: string;
  category: MaterialCategory;
  quantityTons: number;
  location: string;
  coords: [number, number];
  seller: { _id: string; company: string; email: string };
  status: 'open' | 'reserved' | 'awarded';
  pricePerTon: number;
  certifications: string[];
  availableFrom: string;
  expiresOn: string;
  pickupRequirements: string;
  documents: string[];
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_FILTER: ListingFilter = {
  role: 'all',
  category: 'all',
  location: '',
  minQuantity: 0,
};

@Injectable({
  providedIn: 'root',
})
export class WasteService {
  private readonly filterSubject = new BehaviorSubject<ListingFilter>(DEFAULT_FILTER);
  private readonly listingsSubject = new BehaviorSubject<WasteListing[]>([]);

  readonly filter$ = this.filterSubject.asObservable();
  readonly listings$ = this.listingsSubject.asObservable();

  readonly filteredListings$ = combineLatest([
    this.listings$,
    this.filter$,
    this.authService.user$,
  ]).pipe(
    map(([listings, filter, user]) => {
      let filtered = listings.filter((listing) => this.matchesFilter(listing, filter));
      
      // For buyers, only show open listings (not reserved or awarded)
      if (user?.role === 'buyer') {
        filtered = filtered.filter((listing) => listing.status === 'open');
      }
      
      return filtered;
    })
  );

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Wait for session restoration, then reload listings when user changes
    combineLatest([
      this.authService.sessionRestored$,
      this.authService.user$
    ]).subscribe(([restored, user]) => {
      if (restored) {
        if (user) {
          // User logged in and session restored, reload listings
          // Small delay to ensure token is available
          setTimeout(() => {
            this.loadListings();
          }, 200);
        } else {
          // User logged out, clear listings
          this.listingsSubject.next([]);
        }
      }
    });
  }

  get categories(): MaterialCategory[] {
    return ['metals', 'plastics', 'chemicals', 'organics', 'construction', 'textiles'];
  }

  loadListings(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.log('No token available, skipping listings load');
      return;
    }

    this.loadListingsObservable().subscribe();
  }

  private loadListingsObservable(): Observable<WasteListing[]> {
    const token = this.authService.getToken();
    if (!token) {
      console.log('No token available, skipping listings load');
      return of([]);
    }

    console.log('Loading listings...');
    return this.http
      .get<BackendListing[]>(`${environment.apiUrl}/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap((backendListings) => {
          console.log('Received listings from backend:', backendListings.length);
          backendListings.forEach((listing) => {
            console.log(`Listing ${listing._id}: thumbnail = "${listing.thumbnail}"`);
          });
        }),
        map((listings) => listings.map((l) => this.transformListing(l))),
        tap((listings) => {
          console.log('Transformed listings:', listings.length);
          listings.forEach((listing) => {
            console.log(`Listing ${listing.id}: thumbnail URL = "${listing.thumbnail}"`);
          });
          this.listingsSubject.next(listings);
        }),
        catchError((error) => {
          console.error('Load listings error:', error);
          return of([]);
        })
      );
  }

  private transformListing(backend: BackendListing): WasteListing {
    const thumbnailUrl = getFileUrl(backend.thumbnail);
    console.log(`Transforming listing ${backend._id}: backend.thumbnail="${backend.thumbnail}", final URL="${thumbnailUrl}"`);
    
    return {
      id: backend._id,
      title: backend.title,
      material: backend.material,
      category: backend.category,
      quantityTons: backend.quantityTons,
      location: backend.location,
      coords: backend.coords,
      seller: typeof backend.seller === 'object' ? backend.seller.company : backend.seller,
      status: backend.status,
      pricePerTon: backend.pricePerTon,
      certifications: backend.certifications,
      availableFrom: new Date(backend.availableFrom).toISOString().split('T')[0],
      expiresOn: new Date(backend.expiresOn).toISOString().split('T')[0],
      pickupRequirements: backend.pickupRequirements,
      documents: backend.documents,
      thumbnail: thumbnailUrl,
      matchedRole: 'buyer', // Will be determined by user role
    };
  }

  updateFilter(partial: Partial<ListingFilter>): void {
    this.filterSubject.next({ ...this.filterSubject.value, ...partial });
    this.loadListings(); // Reload with new filter
  }

  addListing(input: Omit<WasteListing, 'id' | 'status'>): Observable<WasteListing> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Not authenticated');
    }

    const payload = {
      title: input.title,
      material: input.material,
      category: input.category,
      quantityTons: input.quantityTons,
      location: input.location,
      coords: input.coords,
      pricePerTon: input.pricePerTon,
      certifications: input.certifications,
      availableFrom: input.availableFrom,
      expiresOn: input.expiresOn,
      pickupRequirements: input.pickupRequirements,
      documents: input.documents,
      thumbnail: input.thumbnail,
    };

    console.log('Creating listing with payload:', {
      ...payload,
      thumbnail: payload.thumbnail,
      thumbnailType: typeof payload.thumbnail,
      thumbnailLength: payload.thumbnail?.length
    });

    return this.http
      .post<BackendListing>(`${environment.apiUrl}/listings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap((backendListing) => {
          console.log('Backend returned listing:', {
            id: backendListing._id,
            thumbnail: backendListing.thumbnail,
            thumbnailType: typeof backendListing.thumbnail
          });
        }),
        map((listing) => {
          const transformed = this.transformListing(listing);
          console.log('Transformed listing for display:', {
            id: transformed.id,
            thumbnail: transformed.thumbnail,
            thumbnailUrl: transformed.thumbnail
          });
          this.listingsSubject.next([transformed, ...this.listingsSubject.value]);
          return transformed;
        }),
        catchError((error) => {
          console.error('Add listing error:', error);
          return throwError(() => error.error?.message || 'Failed to create listing');
        })
      );
  }

  getListingById(id: string): Observable<WasteListing | undefined> {
    const token = this.authService.getToken();
    if (!token) {
      return of(undefined);
    }

    return this.http
      .get<BackendListing>(`${environment.apiUrl}/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((listing) => this.transformListing(listing)),
        catchError((error) => {
          console.error('Get listing error:', error);
          return of(undefined);
        })
      );
  }

  updateListing(id: string, updates: Partial<WasteListing>): Observable<WasteListing> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Not authenticated');
    }

    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.material) payload.material = updates.material;
    if (updates.category) payload.category = updates.category;
    if (updates.quantityTons !== undefined) payload.quantityTons = updates.quantityTons;
    if (updates.location) payload.location = updates.location;
    if (updates.coords) payload.coords = updates.coords;
    if (updates.pricePerTon !== undefined) payload.pricePerTon = updates.pricePerTon;
    if (updates.certifications) payload.certifications = updates.certifications;
    if (updates.availableFrom) payload.availableFrom = updates.availableFrom;
    if (updates.expiresOn) payload.expiresOn = updates.expiresOn;
    if (updates.pickupRequirements !== undefined) payload.pickupRequirements = updates.pickupRequirements;
    if (updates.documents) payload.documents = updates.documents;
    if (updates.thumbnail !== undefined) payload.thumbnail = updates.thumbnail;

    return this.http
      .put<BackendListing>(`${environment.apiUrl}/listings/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((listing) => {
          const transformed = this.transformListing(listing);
          const currentListings = this.listingsSubject.value;
          const index = currentListings.findIndex((l) => l.id === id);
          if (index >= 0) {
            currentListings[index] = transformed;
            this.listingsSubject.next([...currentListings]);
          }
          return transformed;
        }),
        catchError((error) => {
          console.error('Update listing error:', error);
          return throwError(() => error.error?.message || 'Failed to update listing');
        })
      );
  }

  deleteListing(id: string): Observable<boolean> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Not authenticated');
    }

    return this.http
      .delete(`${environment.apiUrl}/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map(() => {
          const currentListings = this.listingsSubject.value;
          this.listingsSubject.next(currentListings.filter((l) => l.id !== id));
          return true;
        }),
        catchError((error) => {
          console.error('Delete listing error:', error);
          return throwError(() => error.error?.message || 'Failed to delete listing');
        })
      );
  }

  private matchesFilter(listing: WasteListing, filter: ListingFilter): boolean {
    const categoryMatch =
      filter.category === 'all' || listing.category === filter.category;
    const locationMatch =
      !filter.location ||
      listing.location.toLowerCase().includes(filter.location.toLowerCase());
    const quantityMatch = listing.quantityTons >= (filter.minQuantity || 0);
    return categoryMatch && locationMatch && quantityMatch;
  }
}
