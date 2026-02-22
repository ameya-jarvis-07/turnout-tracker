import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly DEVICE_KEY = 'device_fingerprint';

  constructor() {}

  // Token Management
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // User Management
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Device Fingerprint
  setDeviceFingerprint(fingerprint: string): void {
    localStorage.setItem(this.DEVICE_KEY, fingerprint);
  }

  getDeviceFingerprint(): string | null {
    return localStorage.getItem(this.DEVICE_KEY);
  }

  removeDeviceFingerprint(): void {
    localStorage.removeItem(this.DEVICE_KEY);
  }

  // Clear All
  clearAll(): void {
    this.removeToken();
    this.removeUser();
    // Keep device fingerprint
  }

  // Generic Storage
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
