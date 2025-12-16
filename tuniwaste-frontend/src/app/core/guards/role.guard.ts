import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user-role.type';

/**
 * Guard that only allows access if user has the specified role
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.user$.pipe(
      take(1),
      map((user) => {
        // Must be logged in and verified
        if (!user || !user.verified) {
          router.navigate(['/auth']);
          return false;
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(user.role)) {
          // Redirect to dashboard if role doesn't match
          router.navigate(['/dashboard']);
          return false;
        }

        return true;
      })
    );
  };
}


