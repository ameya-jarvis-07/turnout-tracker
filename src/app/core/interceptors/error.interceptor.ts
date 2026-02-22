import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            // Unauthorized - redirect to login
            errorMessage = 'Unauthorized. Please login again.';
            authService.logout();
            router.navigate(['/auth/login']);
            break;
          case 403:
            // Forbidden
            errorMessage = 'Access denied. You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || error.message || 'Something went wrong';
        }
      }

      console.error('HTTP Error:', errorMessage, error);
      
      // Return error with user-friendly message
      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        error: error.error
      }));
    })
  );
};
