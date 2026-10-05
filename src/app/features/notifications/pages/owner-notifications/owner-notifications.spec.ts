import {
  ChangeDetectorRef
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  of
} from 'rxjs';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  NotificationItem,
  NotificationService,
  NotificationType
} from '../../../../core/services/notification.service';

import {
  OwnerNotifications
} from './owner-notifications';

describe('OwnerNotifications', () => {

  let notificationService: {
    getAll: ReturnType<typeof vi.fn>;
    getUnreadCount: ReturnType<typeof vi.fn>;
    markAsRead: ReturnType<typeof vi.fn>;
    markAllAsRead: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    deleteAll: ReturnType<typeof vi.fn>;
  };

  let router: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  let cdr: {
    detectChanges: ReturnType<typeof vi.fn>;
  };

  let component: OwnerNotifications;

  const createNotification = (
    overrides: Partial<NotificationItem> = {}
  ): NotificationItem => ({
    id: 'notification-1',
    title: 'Nouvelle réservation',
    message: 'Une réservation a été créée.',
    icon: null,
    link: '/dashboard',
    type: NotificationType.BookingCreated,
    isRead: false,
    createdAt: '2026-10-05T10:00:00Z',
    readAt: null,
    ...overrides
  });

  beforeEach(() => {

    notificationService = {
      getAll: vi.fn(),
      getUnreadCount: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      delete: vi.fn(),
      deleteAll: vi.fn()
    };

    router = {
      navigateByUrl: vi.fn()
    };

    cdr = {
      detectChanges: vi.fn()
    };

    component = new OwnerNotifications(
      notificationService as unknown as NotificationService,
      router as unknown as Router,
      cdr as unknown as ChangeDetectorRef
    );
  });

  it('should load notifications on init', () => {

    notificationService.getAll
      .mockReturnValue(
        of([
          createNotification()
        ])
      );

    notificationService.getUnreadCount
      .mockReturnValue(
        of({
          count: 1
        })
      );

    component.ngOnInit();

    expect(component.notifications)
      .toHaveLength(1);

    expect(component.unreadCount)
      .toBe(1);

    expect(component.isLoading)
      .toBe(false);

    expect(
      notificationService.getUnreadCount
    ).toHaveBeenCalledTimes(1);
  });

  it('should mark one notification as read', () => {

    const notification =
      createNotification();

    component.notifications = [
      notification
    ];

    notificationService.markAsRead
      .mockReturnValue(
        of({
          message: 'ok'
        })
      );

    component.markAsRead(notification);

    expect(
      notificationService.markAsRead
    ).toHaveBeenCalledWith(
      notification.id
    );

    expect(notification.isRead)
      .toBe(true);

    expect(component.unreadCount)
      .toBe(0);
  });

  it('should mark all notifications as read', () => {

    component.notifications = [
      createNotification(),
      createNotification({
        id: 'notification-2'
      })
    ];

    notificationService.markAllAsRead
      .mockReturnValue(
        of({
          message: 'ok'
        })
      );

    component.markAllAsRead();

    expect(
      notificationService.markAllAsRead
    ).toHaveBeenCalledTimes(1);

    expect(
      component.notifications.every(
        notification =>
          notification.isRead
      )
    ).toBe(true);
  });

  it('should delete one notification and preserve its unread state for the service', () => {

    const notification =
      createNotification();

    component.notifications = [
      notification
    ];

    notificationService.delete
      .mockReturnValue(of(undefined));

    component.deleteNotification(
      notification
    );

    expect(
      notificationService.delete
    ).toHaveBeenCalledWith(
      notification.id,
      true
    );

    expect(component.notifications)
      .toHaveLength(0);
  });

  it('should navigate to a safe internal link after opening an unread notification', () => {

    const notification =
      createNotification({
        link: '/dashboard/salons/test'
      });

    notificationService.markAsRead
      .mockReturnValue(
        of({
          message: 'ok'
        })
      );

    component.openNotification(
      notification
    );

    expect(notification.isRead)
      .toBe(true);

    expect(router.navigateByUrl)
      .toHaveBeenCalledWith(
        '/dashboard/salons/test'
      );
  });

  it('should not navigate to an external notification link', () => {

    const notification =
      createNotification({
        isRead: true,
        link: 'https://example.com'
      });

    component.openNotification(
      notification
    );

    expect(router.navigateByUrl)
      .not.toHaveBeenCalled();
  });
});
