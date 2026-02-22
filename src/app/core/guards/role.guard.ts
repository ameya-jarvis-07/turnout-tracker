import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getUserRole();

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect to appropriate dashboard or unauthorized page
    if (userRole === 'Admin') {
      router.navigate(['/admin/dashboard']);
    } else if (userRole === 'Faculty') {
      router.navigate(['/faculty/dashboard']);
    } else if (userRole === 'Student') {
      router.navigate(['/student/dashboard']);
    } else {
      router.navigate(['/auth/login']);
    }

    return false;
  };
};
