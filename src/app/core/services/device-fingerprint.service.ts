import { Injectable } from '@angular/core';
import Fingerprint2 from 'fingerprintjs2';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceFingerprintService {
  private fingerprint: string | null = null;

  constructor(private storageService: StorageService) {}

  async generateFingerprint(): Promise<string> {
    // Check if we already have a fingerprint in storage
    const storedFingerprint = this.storageService.getDeviceFingerprint();
    if (storedFingerprint) {
      this.fingerprint = storedFingerprint;
      return storedFingerprint;
    }

    // Generate new fingerprint
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Fingerprint2.get((components: any[]) => {
          try {
            // Extract values from components
            const values = components.map(component => component.value);
            
            // Create a hash from the values
            const fingerprintString = values.join('|');
            const hash = this.hashCode(fingerprintString);
            
            this.fingerprint = hash;
            this.storageService.setDeviceFingerprint(hash);
            
            resolve(hash);
          } catch (error) {
            reject(error);
          }
        });
      }, 500);
    });
  }

  async getFingerprint(): Promise<string> {
    if (this.fingerprint) {
      return this.fingerprint;
    }
    return await this.generateFingerprint();
  }

  getDeviceName(): string {
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';

    // Detect OS
    if (userAgent.indexOf('Win') !== -1) deviceName = 'Windows PC';
    else if (userAgent.indexOf('Mac') !== -1) deviceName = 'Mac';
    else if (userAgent.indexOf('Linux') !== -1) deviceName = 'Linux PC';
    else if (userAgent.indexOf('Android') !== -1) deviceName = 'Android Device';
    else if (userAgent.indexOf('iOS') !== -1) deviceName = 'iOS Device';

    // Add browser info
    if (userAgent.indexOf('Chrome') !== -1) deviceName += ' - Chrome';
    else if (userAgent.indexOf('Firefox') !== -1) deviceName += ' - Firefox';
    else if (userAgent.indexOf('Safari') !== -1) deviceName += ' - Safari';
    else if (userAgent.indexOf('Edge') !== -1) deviceName += ' - Edge';

    return deviceName;
  }

  // Simple hash function to convert fingerprint components to a hash string
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to positive hex string
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}
