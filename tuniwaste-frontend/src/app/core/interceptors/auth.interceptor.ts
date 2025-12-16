import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorHandlerService } from '../services/error-handler.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const errorHandler = inject(ErrorHandlerService);

  // Get token and add to request if available
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // CRITICAL: NEVER log out on messaging endpoints
      const isMessagingEndpoint = req.url.includes('/messages');
      const isAuthMeEndpoint = req.url.includes('/auth/me');
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      
      // Handle 401/403 errors
      if (error.status === 401 || error.status === 403) {
        // NEVER log out for messaging or auth/me endpoints
        if (isMessagingEndpoint || isAuthMeEndpoint) {
          // Just pass through the error - let component handle it
          return throwError(() => error);
        }
        
        // For auth endpoints (login/register), clear token on 401/403
        if (isAuthEndpoint) {
          authService.logout();
          router.navigate(['/auth']);
          return throwError(() => error);
        }
        
        // For other endpoints, show error but DON'T log out
        // The component should handle the error appropriately
        errorHandler.handleError(error, req.url);
      } else {
        // For non-auth errors, just show toast
        errorHandler.handleError(error, req.url);
      }
      
      return throwError(() => error);
    })
  );
};
