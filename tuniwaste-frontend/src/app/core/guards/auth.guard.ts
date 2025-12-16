import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if there's a token first - if yes, allow access even if user$ is null
  // (session might be restoring or token might be invalid, but let the component handle it)
  const token = authService.getToken();
  
  if (!token) {
    // No token at all - definitely not logged in, redirect immediately
    router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  // Has token - wait for session restoration, then check user
  return authService.sessionRestored$.pipe(
    filter((restored) => restored), // Wait until session is restored
    take(1),
    switchMap(() => authService.user$),
    take(1),
    map((user) => {
      if (!user) {
        // Token exists but user is null - token might be invalid
        // But don't redirect here - let the component handle the error
        // This prevents redirect loops when API calls fail
        return true;
      }
      
      // If logged in but not verified, redirect to verification
      if (!user.verified) {
        router.navigate(['/verification']);
        return false;
      }
      
      // Allow access if logged in and verified
      return true;
    })
  );
};

