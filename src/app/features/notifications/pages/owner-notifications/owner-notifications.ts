import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import {
  NotificationItem,
  NotificationService,
  NotificationType
} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-owner-notifications',
  imports: [DatePipe],
  templateUrl: './owner-notifications.html',
  styleUrl: './owner-notifications.css'
})
export class OwnerNotifications implements OnInit {

  notifications: NotificationItem[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  processingId: string | null = null;
  isProcessingAll = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  get unreadCount(): number {
    return this.notifications.filter(
      notification => !notification.isRead
    ).length;
  }

  markAsRead(
    notification: NotificationItem
  ): void {
    if (
      notification.isRead ||
      this.processingId ||
      this.isProcessingAll
    ) {
      return;
    }

    this.clearMessages();
    this.processingId = notification.id;

    this.notificationService
      .markAsRead(notification.id)
      .subscribe({
        next: () => {
          notification.isRead = true;
          notification.readAt =
            new Date().toISOString();

          this.processingId = null;
          this.cdr.detectChanges();
        },
        error: () => {
          this.processingId = null;
          this.errorMessage =
            'Impossible de marquer cette notification comme lue.';
          this.cdr.detectChanges();
        }
      });
  }

  markAllAsRead(): void {
    if (
      this.unreadCount === 0 ||
      this.isProcessingAll ||
      this.processingId
    ) {
      return;
    }

    this.clearMessages();
    this.isProcessingAll = true;

    this.notificationService
      .markAllAsRead()
      .subscribe({
        next: () => {
          const now = new Date().toISOString();

          this.notifications =
            this.notifications.map(notification => ({
              ...notification,
              isRead: true,
              readAt: notification.readAt ?? now
            }));

          this.isProcessingAll = false;
          this.successMessage =
            'Toutes les notifications ont été marquées comme lues.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.isProcessingAll = false;
          this.errorMessage =
            'Impossible de marquer les notifications comme lues.';
          this.cdr.detectChanges();
        }
      });
  }

  deleteNotification(
    notification: NotificationItem
  ): void {
    if (
      this.processingId ||
      this.isProcessingAll
    ) {
      return;
    }

    this.clearMessages();
    this.processingId = notification.id;

    this.notificationService
      .delete(
        notification.id,
        !notification.isRead
      )
      .subscribe({
        next: () => {
          this.notifications =
            this.notifications.filter(
              item => item.id !== notification.id
            );

          this.processingId = null;
          this.successMessage =
            'Notification supprimée.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.processingId = null;
          this.errorMessage =
            'Impossible de supprimer cette notification.';
          this.cdr.detectChanges();
        }
      });
  }

  deleteAll(): void {
    if (
      this.notifications.length === 0 ||
      this.isProcessingAll ||
      this.processingId
    ) {
      return;
    }

    const confirmed = window.confirm(
      'Supprimer toutes les notifications ?'
    );

    if (!confirmed) {
      return;
    }

    this.clearMessages();
    this.isProcessingAll = true;

    this.notificationService
      .deleteAll()
      .subscribe({
        next: () => {
          this.notifications = [];
          this.isProcessingAll = false;
          this.successMessage =
            'Toutes les notifications ont été supprimées.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.isProcessingAll = false;
          this.errorMessage =
            'Impossible de supprimer les notifications.';
          this.cdr.detectChanges();
        }
      });
  }

  openNotification(
    notification: NotificationItem
  ): void {
    const navigate = (): void => {
      const link = notification.link?.trim();

      if (
        link &&
        link.startsWith('/') &&
        !link.startsWith('//')
      ) {
        this.router.navigateByUrl(link);
      }
    };

    if (notification.isRead) {
      navigate();
      return;
    }

    if (
      this.processingId ||
      this.isProcessingAll
    ) {
      return;
    }

    this.clearMessages();
    this.processingId = notification.id;

    this.notificationService
      .markAsRead(notification.id)
      .subscribe({
        next: () => {
          notification.isRead = true;
          notification.readAt =
            new Date().toISOString();

          this.processingId = null;
          this.cdr.detectChanges();

          navigate();
        },
        error: () => {
          this.processingId = null;
          this.errorMessage =
            'Impossible d’ouvrir cette notification.';
          this.cdr.detectChanges();
        }
      });
  }

  getTypeLabel(
    type: NotificationType
  ): string {
    switch (type) {
      case NotificationType.BookingCreated:
        return 'Nouvelle réservation';
      case NotificationType.BookingConfirmed:
        return 'Réservation confirmée';
      case NotificationType.BookingCancelled:
        return 'Réservation annulée';
      case NotificationType.BookingCompleted:
        return 'Réservation terminée';
      case NotificationType.Reminder:
        return 'Rappel';
      case NotificationType.PaymentReceived:
        return 'Paiement reçu';
      case NotificationType.PaymentFailed:
        return 'Paiement échoué';
      case NotificationType.Review:
        return 'Avis client';
      case NotificationType.Promotion:
        return 'Promotion';
      default:
        return 'Information';
    }
  }

  private loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService
      .getAll()
      .subscribe({
        next: notifications => {
          this.notifications = notifications;
          this.isLoading = false;

          this.notificationService
            .getUnreadCount()
            .subscribe({
              error: () => {
                // The page remains usable if only
                // the navbar counter cannot refresh.
              }
            });

          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Impossible de charger les notifications.';
          this.cdr.detectChanges();
        }
      });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
