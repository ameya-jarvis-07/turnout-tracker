import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { CurrentUser, UserDto } from '../models/user.model';
import { StorageService } from './storage.service';
import { DeviceFingerprintService } from './device-fingerprint.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/Auth`;
  
  // Signals for reactive state
  currentUser = signal<CurrentUser | null>(null);
  isAuthenticated = signal<boolean>(false);
  
  // BehaviorSubject for backward compatibility
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private deviceFingerprintService: DeviceFingerprintService
  ) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = this.storageService.getToken();
    const user = this.storageService.getUser();
    
    if (token && user) {
      const currentUser: CurrentUser = { ...user, token };
      this.currentUser.set(currentUser);
      this.currentUserSubject.next(currentUser);
      this.isAuthenticated.set(true);
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const deviceFingerprintHash = await this.deviceFingerprintService.getFingerprint();
    const deviceName = this.deviceFingerprintService.getDeviceName();

    const loginRequest: LoginRequest = {
      email,
      password,
      deviceFingerprintHash,
      deviceName
    };

    return new Promise((resolve, reject) => {
      this.http.post<LoginResponse>(`${this.API_URL}/login`, loginRequest)
        .subscribe({
          next: (response) => {
            if (response.success && response.token && response.user) {
              this.storageService.setToken(response.token);
              this.storageService.setUser(response.user);
              
              const currentUser: CurrentUser = {
                ...response.user,
                token: response.token
              };
              
              this.currentUser.set(currentUser);
              this.currentUserSubject.next(currentUser);
              this.isAuthenticated.set(true);
            }
            resolve(response);
          },
          error: (error) => reject(error)
        });
    });
  }

  register(registerData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, registerData);
  }

  logout(): void {
    this.storageService.clearAll();
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }

  getUserRole(): string | null {
    const user = this.currentUser();
    return user?.role || null;
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate < new Date();
  }
}
