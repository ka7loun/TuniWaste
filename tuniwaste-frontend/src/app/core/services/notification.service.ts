import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, interval, map, of, switchMap, tap, throwError } from 'rxjs';
import { NotificationItem } from '../models/notification.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

interface BackendNotification {
  _id: string;
  type: 'bid' | 'message' | 'compliance' | 'system';
  title: string;
  detail: string;
  read: boolean;
  timestamp: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadNotifications();
    // Poll for new notifications every 10 seconds
    interval(10000)
      .pipe(switchMap(() => this.loadNotifications()))
      .subscribe();
  }

  private loadNotifications(): Observable<NotificationItem[]> {
    const token = this.authService.getToken();
    if (!token) {
      return of([]);
    }

    return this.http
      .get<BackendNotification[]>(`${environment.apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((notifications) =>
          notifications.map((n) => ({
            id: n._id,
            type: n.type,
            title: n.title,
            detail: n.detail,
            timestamp: n.timestamp || n.createdAt,
            read: n.read,
          }))
        ),
        tap((notifications) => this.notificationsSubject.next(notifications)),
        catchError((error) => {
          console.error('Load notifications error:', error);
          return of([]);
        })
      );
  }

  unreadCount$(): Observable<number> {
    return this.notifications$.pipe(
      map((items) => items.filter((item) => !item.read).length)
    );
  }

  markAsRead(id: string): Observable<void> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Not authenticated');
    }

    return this.http
      .put(
        `${environment.apiUrl}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(
        map(() => {
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          this.notificationsSubject.next(updated);
        }),
        catchError((error) => {
          console.error('Mark as read error:', error);
          return throwError(() => error.error?.message || 'Failed to mark as read');
        })
      );
  }

  push(notification: NotificationItem): void {
    this.notificationsSubject.next([notification, ...this.notificationsSubject.value]);
  }
}
