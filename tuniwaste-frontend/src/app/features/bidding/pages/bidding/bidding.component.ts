import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { AuthUser } from '../../../../core/services/auth.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { AuthService } from '../../../../core/services/auth.service';
import { BiddingService } from '../../../../core/services/bidding.service';
import { WasteService } from '../../../../core/services/waste.service';
import { WasteListing } from '../../../../core/models/waste-listing.model';
import { Bid } from '../../../../core/models/bid.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-bidding',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, SectionHeadingComponent],
  templateUrl: './bidding.component.html',
  styleUrl: './bidding.component.scss',
})
export class BiddingComponent implements OnInit {
  readonly user$: Observable<AuthUser | null>;
  readonly isSeller$: Observable<boolean>;
  readonly isBuyer$: Observable<boolean>;
  readonly listings$: Observable<WasteListing[]>;
  readonly allBids$: Observable<Bid[]>;
  readonly myListings$: Observable<WasteListing[]>;
  readonly bidsOnMyListings$: Observable<Array<Bid & { listingTitle: string }>>;
  readonly myBids$: Observable<Array<Bid & { listingTitle: string }>>;
  readonly selectedListing$: Observable<WasteListing | null>;

  readonly bidForm = this.fb.group({
    listingId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly biddingService: BiddingService,
    private readonly wasteService: WasteService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.user$ = this.authService.user$;
    this.isSeller$ = this.authService.user$.pipe(
      map((user) => user?.role === 'generator' || false)
    );
    this.isBuyer$ = this.authService.user$.pipe(
      map((user) => user?.role === 'buyer' || false)
    );
    this.listings$ = this.wasteService.listings$;
    this.allBids$ = this.biddingService.bids$;

    // Selected listing for preview
    this.selectedListing$ = combineLatest([
      this.listings$,
      this.bidForm.get('listingId')!.valueChanges.pipe(startWith(this.bidForm.get('listingId')?.value || null))
    ]).pipe(
      map(([listings, listingId]: [WasteListing[], string | null]) => {
        if (!listingId) return null;
        return listings.find((l: WasteListing) => l.id === listingId) || null;
      })
    );

    // Seller: Their listings with bids
    this.myListings$ = combineLatest([
      this.authService.user$,
      this.wasteService.listings$
    ]).pipe(
      map(([user, listings]: [AuthUser | null, WasteListing[]]) => {
        if (!user || user.role !== 'generator') return [];
        return listings.filter((l: WasteListing) => l.seller === user.company || l.seller.includes(user.company));
      })
    );

    // Seller: Bids on their listings - backend already filters by seller's listings
    this.bidsOnMyListings$ = combineLatest([
      this.authService.user$,
      this.biddingService.bids$,
      this.wasteService.listings$
    ]).pipe(
      map(([user, bids, listings]: [AuthUser | null, Bid[], WasteListing[]]) => {
        if (!user || user.role !== 'generator') return [];
        // Backend already returns only bids on this seller's listings, so just add listing titles
        return bids.map((bid: Bid) => ({
          ...bid,
          listingTitle: listings.find((l: WasteListing) => l.id === bid.listingId)?.title || 
                       (typeof (bid as any).listingId === 'object' ? (bid as any).listingId?.title : 'Unknown')
        }));
      })
    );

    // Buyer: Their bids - backend already filters by user ID, so we just need to add listing titles
    this.myBids$ = combineLatest([
      this.authService.user$,
      this.biddingService.bids$,
      this.wasteService.listings$
    ]).pipe(
      map(([user, bids, listings]: [AuthUser | null, Bid[], WasteListing[]]) => {
        if (!user || user.role !== 'buyer') return [];
        // Backend already returns only this user's bids, so no need to filter
        return bids.map((bid: Bid) => ({
          ...bid,
          listingTitle: listings.find((l: WasteListing) => l.id === bid.listingId)?.title || 'Unknown'
        }));
      })
    );
  }

  ngOnInit(): void {
    // Pre-select listing if provided in query params
    this.route.queryParams.subscribe(params => {
      if (params['listingId']) {
        this.bidForm.patchValue({ listingId: params['listingId'] });
      }
    });

    // Auto-fill bidder from logged-in user
    this.user$.subscribe(user => {
      if (user && user.role === 'buyer') {
        // Form doesn't need bidder field anymore, it's auto-filled
      }
    });
  }

  submit(): void {
    if (this.bidForm.invalid) {
      this.bidForm.markAllAsTouched();
      return;
    }
    const user = this.authService.snapshot();
    if (!user) return;
    
    const { listingId, amount } = this.bidForm.getRawValue();
    
    this.biddingService.placeBid(listingId ?? '', user.company, Number(amount)).subscribe({
      next: (bid) => {
        // Success - reload bids immediately
        this.biddingService.loadMyBids().subscribe();
        this.bidForm.reset({ listingId: '', amount: 0 });
        this.toastService.show('Bid placed successfully!', 'success');
      },
      error: (error) => {
        console.error('Failed to place bid:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to place bid. Please try again.';
        this.toastService.show(errorMessage, 'error');
      }
    });
  }

  acceptBid(bidId: string): void {
    this.biddingService.acceptBid(bidId).subscribe({
      next: (bid) => {
        // Reload bids and listings
        this.biddingService.loadMyBids().subscribe();
        this.wasteService.loadListings();
        this.toastService.show('Bid accepted! Transaction created.', 'success');
      },
      error: (error) => {
        console.error('Failed to accept bid:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to accept bid. Please try again.';
        this.toastService.show(errorMessage, 'error');
      }
    });
  }

  declineBid(bidId: string): void {
    this.biddingService.declineBid(bidId).subscribe({
      next: (bid) => {
        // Reload bids
        this.biddingService.loadMyBids().subscribe();
        this.toastService.show('Bid declined.', 'info');
      },
      error: (error) => {
        console.error('Failed to decline bid:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to decline bid. Please try again.';
        this.toastService.show(errorMessage, 'error');
      }
    });
  }
}
