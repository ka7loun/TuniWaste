import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService, AuthUser } from '../../../../core/services/auth.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { NotificationItem } from '../../../../core/models/notification.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Transaction } from '../../../../core/models/transaction.model';
import { TransactionService } from '../../../../core/services/transaction.service';
import { BiddingService } from '../../../../core/services/bidding.service';
import { WasteService } from '../../../../core/services/waste.service';
import { WasteListing } from '../../../../core/models/waste-listing.model';
import { Bid } from '../../../../core/models/bid.model';
import { AdminService, DashboardStats, ActivityItem } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-dashboard-hub',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink, SectionHeadingComponent, StatCardComponent, LoadingSkeletonComponent],
  templateUrl: './dashboard-hub.component.html',
  styleUrl: './dashboard-hub.component.scss',
})
export class DashboardHubComponent {
  readonly notifications$: Observable<NotificationItem[]>;
  readonly transactions$: Observable<Transaction[]>;
  readonly user$: Observable<AuthUser | null>;
  readonly isSeller$: Observable<boolean>;
  readonly isBuyer$: Observable<boolean>;
  readonly isAdmin$!: Observable<boolean>;
  readonly myListings$: Observable<WasteListing[]>;
  readonly availableListings$: Observable<WasteListing[]>;
  readonly bidsReceived$: Observable<Array<Bid & { listingTitle: string }>>;
  readonly myBids$: Observable<Array<Bid & { listingTitle: string }>>;

  readonly kpis$: Observable<Array<{ label: string; value: string; delta: string; positive: boolean }>>;
  
  // Admin-specific observables
  readonly adminStats$!: Observable<DashboardStats | null>;
  readonly adminActivities$!: Observable<ActivityItem[]>;

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly transactionService: TransactionService,
    private readonly biddingService: BiddingService,
    private readonly wasteService: WasteService,
    private readonly adminService: AdminService
  ) {
    this.user$ = this.authService.user$;
    this.notifications$ = this.notificationService.notifications$;
    this.transactions$ = this.transactionService.transactions$;
    
    this.isSeller$ = this.authService.user$.pipe(
      map((user) => user?.role === 'generator' || false)
    );
    
    this.isBuyer$ = this.authService.user$.pipe(
      map((user) => user?.role === 'buyer' || false)
    );
    
    this.isAdmin$ = this.authService.user$.pipe(
      map((user) => user?.role === 'admin' || false)
    );

    // Load admin stats when admin user is detected
    this.adminStats$ = this.isAdmin$.pipe(
      switchMap((isAdmin) => {
        if (isAdmin) {
          return this.adminService.getDashboardStats().pipe(
            catchError((error) => {
              console.error('Error loading admin stats:', error);
              return of(null);
            })
          );
        }
        return of(null);
      })
    );

    // Load admin activities
    this.adminActivities$ = this.isAdmin$.pipe(
      switchMap((isAdmin) => {
        if (isAdmin) {
          return this.adminService.getActivityTimeline(20, 0).pipe(
            map((timeline) => timeline.activities),
            catchError((error) => {
              console.error('Error loading admin activities:', error);
              return of([]);
            })
          );
        }
        return of([]);
      })
    );

    // Calculate real KPIs from actual data
    this.kpis$ = combineLatest([
      this.authService.user$,
      this.wasteService.listings$,
      this.biddingService.bids$,
      this.transactions$,
      this.adminStats$
    ]).pipe(
      map(([user, listings, bids, transactions, adminStats]: [AuthUser | null, WasteListing[], Bid[], Transaction[], DashboardStats | null]) => {
        if (!user) return [];

        // Admin KPIs
        if (user.role === 'admin' && adminStats) {
          return [
            { 
              label: 'Total Users', 
              value: adminStats.overview.totalUsers.toString(), 
              delta: `${adminStats.overview.verifiedUsers} verified`, 
              positive: true 
            },
            { 
              label: 'Active Listings', 
              value: adminStats.overview.activeListings.toString(), 
              delta: `${adminStats.overview.totalListings} total`, 
              positive: true 
            },
            { 
              label: 'Total Transactions', 
              value: adminStats.overview.totalTransactions.toString(), 
              delta: `${adminStats.overview.completedTransactions} completed`, 
              positive: true 
            },
            { 
              label: 'Waste Diverted', 
              value: `${adminStats.overview.totalWasteDiverted.toFixed(1)} t`, 
              delta: `${adminStats.overview.totalTransactionValue.toFixed(0)} TND value`, 
              positive: true 
            },
          ];
        }

        if (user.role === 'generator') {
          // Seller KPIs - match by user ID from backend
          const myListings = listings.filter((l: WasteListing) => {
            // Backend returns seller as company name string after transformation
            return typeof l.seller === 'string' && l.seller === user.company;
          });
          const activeListings = myListings.filter((l: WasteListing) => l.status === 'open').length;
          const pendingBids = bids.filter((bid: Bid) => {
            const listing = listings.find((l: WasteListing) => l.id === bid.listingId);
            return listing && typeof listing.seller === 'string' && listing.seller === user.company && bid.status === 'pending';
          }).length;
          const activeTransactions = transactions.filter((t: Transaction) => t.stage !== 'delivered').length;

          return [
            { 
              label: 'Active listings', 
              value: activeListings.toString(), 
              delta: `${myListings.length} total`, 
              positive: true 
            },
            { 
              label: 'Pending bids', 
              value: pendingBids.toString(), 
              delta: 'needs review', 
              positive: pendingBids > 0 
            },
            { 
              label: 'Active deals', 
              value: activeTransactions.toString(), 
              delta: 'in progress', 
              positive: true 
            },
          ];
        } else {
          // Buyer KPIs
          const myBids = bids.filter((bid: Bid) => 
            typeof bid.bidder === 'string' ? bid.bidder === user.company : false
          );
          const pendingBids = myBids.filter((bid: Bid) => bid.status === 'pending').length;
          const acceptedBids = myBids.filter((bid: Bid) => bid.status === 'accepted').length;
          const availableListings = listings.filter((l: WasteListing) => l.status === 'open').length;
          const activeTransactions = transactions.filter((t: Transaction) => t.stage !== 'delivered').length;

          return [
            { 
              label: 'Available listings', 
              value: availableListings.toString(), 
              delta: 'open now', 
              positive: true 
            },
            { 
              label: 'My bids', 
              value: myBids.length.toString(), 
              delta: `${pendingBids} pending`, 
              positive: true 
            },
            { 
              label: 'Active deals', 
              value: activeTransactions.toString(), 
              delta: `${acceptedBids} accepted`, 
              positive: true 
            },
          ];
        }
      })
    );

    // Seller: Show their own listings
    this.myListings$ = combineLatest([
      this.authService.user$,
      this.wasteService.listings$
    ]).pipe(
      map(([user, listings]: [AuthUser | null, WasteListing[]]) => {
        if (!user || user.role !== 'generator') return [];
        // Filter listings by seller (in real app, this would be by user ID)
        return listings.filter((l: WasteListing) => l.seller === user.company || l.seller.includes(user.company));
      })
    );

    // Buyer: Show all available listings
    this.availableListings$ = this.wasteService.listings$.pipe(
      map((listings: WasteListing[]) => listings.filter((l: WasteListing) => l.status === 'open'))
    );

    // Seller: Bids received on their listings
    this.bidsReceived$ = combineLatest([
      this.authService.user$,
      this.biddingService.bids$,
      this.wasteService.listings$
    ]).pipe(
      map(([user, bids, listings]: [AuthUser | null, Bid[], WasteListing[]]) => {
        if (!user || user.role !== 'generator') return [];
        // Get listing IDs for this seller
        const myListingIds = listings
          .filter((l: WasteListing) => l.seller === user.company || l.seller.includes(user.company))
          .map((l: WasteListing) => l.id);
        // Get bids for those listings and add listing title
        return bids
          .filter((bid: Bid) => myListingIds.includes(bid.listingId))
          .map((bid: Bid) => ({
            ...bid,
            listingTitle: listings.find((l: WasteListing) => l.id === bid.listingId)?.title || 'Unknown'
          }));
      })
    );

    // Buyer: Their own bids
    this.myBids$ = combineLatest([
      this.authService.user$,
      this.biddingService.bids$,
      this.wasteService.listings$
    ]).pipe(
      map(([user, bids, listings]: [AuthUser | null, Bid[], WasteListing[]]) => {
        if (!user || user.role !== 'buyer') return [];
        // Filter bids by bidder company and add listing title
        return bids
          .filter((bid: Bid) => bid.bidder === user.company || bid.bidder.includes(user.company))
          .map((bid: Bid) => ({
            ...bid,
            listingTitle: listings.find((l: WasteListing) => l.id === bid.listingId)?.title || 'Unknown'
          }));
      })
    );
  }
}
