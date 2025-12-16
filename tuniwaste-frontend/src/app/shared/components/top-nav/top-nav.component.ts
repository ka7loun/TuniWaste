import { CommonModule, DatePipe } from '@angular/common';
import { Component, HostListener, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService, AuthUser } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/notification.model';

export interface NavLink {
  label: string;
  path: string;
}


@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss',
})
export class TopNavComponent {
  @Input() links: NavLink[] | null = [];

  mobileMenuOpen = false;
  userMenuOpen = false;
  notificationMenuOpen = false;

  readonly notifications$: Observable<NotificationItem[]>;
  readonly unreadCount$: Observable<number>;
  readonly isAuthenticated$: Observable<boolean>;
  readonly userRole$: Observable<string | null>;

  readonly user$: Observable<AuthUser | null>;

  router = inject(Router);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService
  ) {
    this.user$ = this.authService.user$;
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$();
    this.isAuthenticated$ = this.authService.isLoggedIn$();
    this.userRole$ = this.authService.user$.pipe(
      map((user) => user?.role || null)
    );
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.userMenuOpen = false;
      this.notificationMenuOpen = false;
    }
  }

  closeMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.mobileMenuOpen = false;
      this.notificationMenuOpen = false;
    }
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  toggleNotificationMenu(): void {
    this.notificationMenuOpen = !this.notificationMenuOpen;
    if (this.notificationMenuOpen) {
      this.mobileMenuOpen = false;
      this.userMenuOpen = false;
    }
  }

  closeNotificationMenu(): void {
    this.notificationMenuOpen = false;
  }

  markAsRead(notification: NotificationItem): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
    
    // Navigate based on type
    if (notification.type === 'message') {
      this.router.navigate(['/messaging']);
    } else if (notification.type === 'bid') {
      this.router.navigate(['/bidding']);
    } else if (notification.type === 'compliance') {
      this.router.navigate(['/profile']);
    }
    
    this.closeNotificationMenu();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
    this.closeUserMenu();
  }

  @HostListener('window:resize')
  handleResize(): void {
    if (window.innerWidth > 960) {
      this.mobileMenuOpen = false;
      this.notificationMenuOpen = false;
      this.userMenuOpen = false;
    }
  }
}
