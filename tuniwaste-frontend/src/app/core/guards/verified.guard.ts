import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard that redirects verified users away from public pages (landing, verification)
 * to the dashboard. Unverified users can access these pages.
 */
export const verifiedRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      // If user is logged in and verified, redirect to dashboard
      if (user && user.verified) {
        router.navigate(['/dashboard']);
        return false;
      }
      // Allow access if not logged in or not verified
      return true;
    })
  );
};

