import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, interval, map, of, switchMap, tap, throwError } from 'rxjs';
import { Bid } from '../models/bid.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

interface BackendBid {
  _id: string;
  listingId: string | { _id: string; title: string };
  bidder: { _id: string; company: string; email: string } | string;
  amount: number;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class BiddingService {
  private readonly bidsSubject = new BehaviorSubject<Bid[]>([]);
  readonly bids$ = this.bidsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Reload bids when user changes (login/logout)
    this.authService.user$.subscribe((user) => {
      if (user) {
        // User logged in, reload bids
        this.loadMyBids().subscribe();
      } else {
        // User logged out, clear bids
        this.bidsSubject.next([]);
      }
    });
    
    // Poll for new bids every 7 seconds (only when user is logged in)
    interval(7000)
      .pipe(
        switchMap(() => {
          const token = this.authService.getToken();
          if (!token) {
            return of([]);
          }
          return this.loadMyBids();
        })
      )
      .subscribe();
  }

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private transformBid(backend: BackendBid): Bid {
    return {
      id: backend._id,
      listingId: typeof backend.listingId === 'object' ? backend.listingId._id : backend.listingId,
      bidder: typeof backend.bidder === 'object' ? backend.bidder.company : backend.bidder,
      amount: backend.amount,
      timestamp: backend.timestamp || backend.createdAt,
      status: backend.status,
    };
  }

  loadMyBids(): Observable<Bid[]> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    return this.http
      .get<BackendBid[]>(`${environment.apiUrl}/bids/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((bids) => bids.map((b) => this.transformBid(b))),
        tap((bids) => this.bidsSubject.next(bids)),
        catchError((error) => {
          console.error('Load bids error:', error);
          return of([]);
        })
      );
  }

  placeBid(listingId: string, bidder: string, amount: number): Observable<Bid> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Not authenticated');
    }

    return this.http
      .post<BackendBid>(
        `${environment.apiUrl}/bids`,
        { listingId, amount },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(
        map((bid) => {
          const transformed = this.transformBid(bid);
          // Reload all bids to get the latest state
          this.loadMyBids().subscribe();
          return transformed;
        }),
        catchError((error) => {
          console.error('Place bid error:', error);
          return throwError(() => error.error?.message || 'Failed to place bid');
        })
      );
  }

  bidsForListing(listingId: string): Observable<Bid[]> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    return this.http
      .get<BackendBid[]>(`${environment.apiUrl}/bids/listing/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((bids) => bids.map((b) => this.transformBid(b))),
        catchError((error) => {
          console.error('Get bids for listing error:', error);
          return of([]);
        })
      );
  }

  acceptBid(bidId: string): Observable<Bid> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Not authenticated');
    }

    return this.http
      .put<BackendBid>(
        `${environment.apiUrl}/bids/${bidId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(
        map((bid) => {
          const transformed = this.transformBid(bid);
          // Reload all bids to get the latest state
          this.loadMyBids().subscribe();
          return transformed;
        }),
        catchError((error) => {
          console.error('Accept bid error:', error);
          return throwError(() => error.error?.message || 'Failed to accept bid');
        })
      );
  }

  declineBid(bidId: string): Observable<Bid> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Not authenticated');
    }

    return this.http
      .put<BackendBid>(
        `${environment.apiUrl}/bids/${bidId}/decline`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(
        map((bid) => {
          const transformed = this.transformBid(bid);
          // Reload all bids to get the latest state
          this.loadMyBids().subscribe();
          return transformed;
        }),
        catchError((error) => {
          console.error('Decline bid error:', error);
          return throwError(() => error.error?.message || 'Failed to decline bid');
        })
      );
  }
}
