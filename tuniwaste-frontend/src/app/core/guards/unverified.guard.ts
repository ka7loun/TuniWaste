import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard that only allows access to verification page if user is logged in but NOT verified.
 * Redirects verified users to dashboard and unauthenticated users to auth.
 */
export const unverifiedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      // If not logged in, redirect to auth
      if (!user) {
        router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
        return false;
      }
      // If already verified, redirect to dashboard
      if (user.verified) {
        router.navigate(['/dashboard']);
        return false;
      }
      // Allow access if logged in but not verified
      return true;
    })
  );
};

