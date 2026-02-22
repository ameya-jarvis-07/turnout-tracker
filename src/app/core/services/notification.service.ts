import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, interval } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto, NotificationBadge } from '../../features/shared/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/Notification`;
  
  // Signals for reactive state
  unreadCount = signal<number>(0);
  notifications = signal<NotificationDto[]>([]);

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  getNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(this.API_URL).pipe(
      tap(notifications => this.notifications.set(notifications))
    );
  }

  getUnreadNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.API_URL}/unread`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/unread-count`).pipe(
      tap(count => this.unreadCount.set(count))
    );
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        const current = this.notifications();
        const updated = current.map(n => 
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        );
        this.notifications.set(updated);
        this.updateUnreadCount();
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.API_URL}/mark-all-read`, {}).pipe(
      tap(() => {
        const current = this.notifications();
        const updated = current.map(n => ({ ...n, isRead: true }));
        this.notifications.set(updated);
        this.unreadCount.set(0);
      })
    );
  }

  private updateUnreadCount(): void {
    const unread = this.notifications().filter(n => !n.isRead).length;
    this.unreadCount.set(unread);
  }

  private startPolling(): void {
    // Poll for new notifications every 30 seconds
    interval(30000).subscribe(() => {
      this.getUnreadCount().subscribe();
    });
  }

  refreshNotifications(): void {
    this.getNotifications().subscribe();
    this.getUnreadCount().subscribe();
  }
}
