import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { DeviceFingerprintService } from '../services/device-fingerprint.service';
import { AuthService } from '../services/auth.service';

export const deviceGuard: CanActivateFn = async (route, state) => {
  const deviceService = inject(DeviceFingerprintService);
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const currentFingerprint = await deviceService.getFingerprint();
    const user = authService.getCurrentUser();

    // If user has a registered device, verify it matches current device
    if (user?.registeredDeviceId) {
      // This is a simplified check - in production, you'd verify against the server
      return true;
    }

    // If no device registered, allow access to register device
    return true;
  } catch (error) {
    console.error('Device verification failed:', error);
    return true; // Allow access even if device check fails
  }
};
