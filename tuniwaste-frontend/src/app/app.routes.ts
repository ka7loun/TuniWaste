import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/pages/landing/landing.component';
import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { KycComponent } from './features/verification/pages/kyc/kyc.component';
import { DashboardHubComponent } from './features/dashboard/pages/dashboard-hub/dashboard-hub.component';
import { ListingsComponent } from './features/listings/pages/listings/listings.component';
import { ListingDetailComponent } from './features/listings/pages/listing-detail/listing-detail.component';
import { ListingEditComponent } from './features/listing-edit/pages/listing-edit/listing-edit.component';
import { ListingCreateComponent } from './features/listing-create/pages/listing-create/listing-create.component';
import { BiddingComponent } from './features/bidding/pages/bidding/bidding.component';
import { MessagingComponent } from './features/messaging/pages/messaging/messaging.component';
import { AnalyticsComponent } from './features/analytics/pages/analytics/analytics.component';
import { ProfileComponent } from './features/profile/pages/profile/profile.component';
import { TransactionsComponent } from './features/transactions/pages/transactions/transactions.component';
import { authGuard } from './core/guards/auth.guard';
import { verifiedRedirectGuard } from './core/guards/verified.guard';
import { unverifiedGuard } from './core/guards/unverified.guard';
import { roleGuard } from './core/guards/role.guard';

import { ErrorComponent } from './core/pages/error/error.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, title: 'TuniWaste | Circular Marketplace', canActivate: [verifiedRedirectGuard] },
  { path: 'auth', component: AuthComponent, title: 'TuniWaste | Sign in' },
  { path: 'verification', component: KycComponent, title: 'TuniWaste | Verification', canActivate: [unverifiedGuard] },
  { path: 'dashboard', component: DashboardHubComponent, title: 'TuniWaste | Dashboard Hub', canActivate: [authGuard] },
  { path: 'listings', component: ListingsComponent, title: 'TuniWaste | Listings', canActivate: [authGuard] },
  { path: 'listings/create', component: ListingCreateComponent, title: 'TuniWaste | Create Listing', canActivate: [authGuard, roleGuard(['generator'])] },
  { path: 'listings/:id', component: ListingDetailComponent, title: 'TuniWaste | Listing Details', canActivate: [authGuard] },
  { path: 'listings/:id/edit', component: ListingEditComponent, title: 'TuniWaste | Edit Listing', canActivate: [authGuard, roleGuard(['generator'])] },
  { path: 'bidding', component: BiddingComponent, title: 'TuniWaste | Bidding', canActivate: [authGuard] },
  { path: 'messaging', component: MessagingComponent, title: 'TuniWaste | Messaging', canActivate: [authGuard] },
  { path: 'transactions', component: TransactionsComponent, title: 'TuniWaste | Transactions', canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, title: 'TuniWaste | Analytics', canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, title: 'TuniWaste | Profile', canActivate: [authGuard] },
  { path: '**', component: ErrorComponent, title: 'TuniWaste | Page Not Found' },
];
