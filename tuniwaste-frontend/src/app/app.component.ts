import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { TopNavComponent, NavLink } from './shared/components/top-nav/top-nav.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TopNavComponent, AsyncPipe, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly currentYear = new Date().getFullYear();
  
  readonly navLinks$: Observable<NavLink[]>;

  constructor(private readonly authService: AuthService) {
    // Show platform links only when authenticated
    // Role-based navigation: sellers see seller links, buyers see buyer links
    this.navLinks$ = this.authService.user$.pipe(
      map((user) => {
        if (!user) {
          return [];
        }
        
        const links: NavLink[] = [];
        
        // Only show Overview and Verification for unverified users
        if (!user.verified) {
          links.push(
            { label: 'Overview', path: '/' },
            { label: 'Verification', path: '/verification' }
          );
        }
        
        // Common links for all authenticated users
        links.push(
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Transactions', path: '/transactions' },
          { label: 'Messaging', path: '/messaging' },
          { label: 'Analytics', path: '/analytics' }
        );
        
        // Role-specific links
        if (user.role === 'generator') {
          // Seller-specific links
          links.push(
            { label: 'My Listings', path: '/listings' },
            { label: 'Bidding', path: '/bidding' }
          );
        } else if (user.role === 'buyer') {
          // Buyer-specific links
          links.push(
            { label: 'Browse Listings', path: '/listings' },
            { label: 'My Bids', path: '/bidding' }
          );
        }
        
        return links;
      })
    );
  }
}
