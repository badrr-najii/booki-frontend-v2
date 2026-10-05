import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap
} from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

export enum NotificationType {
  BookingCreated = 0,
  BookingConfirmed = 1,
  BookingCancelled = 2,
  BookingCompleted = 3,
  Reminder = 4,
  PaymentReceived = 5,
  PaymentFailed = 6,
  System = 7,
  Review = 8,
  Promotion = 9
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  icon: string | null;
  link: string | null;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface UnreadNotificationCount {
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly apiUrl =
    `${API_BASE_URL}/notifications`;

  private readonly unreadCountSubject =
    new BehaviorSubject<number>(0);

  readonly unreadCount$ =
    this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  getAll(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(
      this.apiUrl
    );
  }

  getUnread(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(
      `${this.apiUrl}/unread`
    );
  }

  getUnreadCount(): Observable<UnreadNotificationCount> {
    return this.http
      .get<UnreadNotificationCount>(
        `${this.apiUrl}/unread-count`
      )
      .pipe(
        tap(result =>
          this.unreadCountSubject.next(result.count)
        )
      );
  }

  getById(
    id: string
  ): Observable<NotificationItem> {
    return this.http.get<NotificationItem>(
      `${this.apiUrl}/${id}`
    );
  }

  markAsRead(
    id: string
  ): Observable<{ message: string }> {
    return this.http
      .patch<{ message: string }>(
        `${this.apiUrl}/${id}/read`,
        {}
      )
      .pipe(
        tap(() => this.decrementUnreadCount())
      );
  }

  markAllAsRead():
    Observable<{ message: string }> {
    return this.http
      .patch<{ message: string }>(
        `${this.apiUrl}/read-all`,
        {}
      )
      .pipe(
        tap(() =>
          this.unreadCountSubject.next(0)
        )
      );
  }

  delete(
    id: string,
    wasUnread = false
  ): Observable<void> {
    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        tap(() => {
          if (wasUnread) {
            this.decrementUnreadCount();
          }
        })
      );
  }

  deleteAll(): Observable<void> {
    return this.http
      .delete<void>(this.apiUrl)
      .pipe(
        tap(() =>
          this.unreadCountSubject.next(0)
        )
      );
  }

  clearUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }

  private decrementUnreadCount(): void {
    this.unreadCountSubject.next(
      Math.max(
        0,
        this.unreadCountSubject.value - 1
      )
    );
  }
}
