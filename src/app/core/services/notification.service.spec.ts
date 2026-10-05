import {
  provideHttpClient
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  TestBed
} from '@angular/core/testing';

import {
  firstValueFrom
} from 'rxjs';

import {
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import {
  NotificationService
} from './notification.service';

describe('NotificationService', () => {

  let service: NotificationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(NotificationService);

    httpTesting =
      TestBed.inject(HttpTestingController);
  });

  it('should load notifications', async () => {

    const promise =
      firstValueFrom(service.getAll());

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith('/notifications')
      );

    request.flush([
      {
        id: 'notification-1',
        title: 'Nouvelle réservation',
        message: 'Une réservation a été créée.',
        icon: null,
        link: '/dashboard',
        type: 0,
        isRead: false,
        createdAt: '2026-10-05T10:00:00Z',
        readAt: null
      }
    ]);

    const notifications = await promise;

    expect(notifications).toHaveLength(1);
    expect(notifications[0].id)
      .toBe('notification-1');
  });

  it('should update the shared unread count', async () => {

    const values: number[] = [];

    const subscription =
      service.unreadCount$
        .subscribe(value => values.push(value));

    const promise =
      firstValueFrom(service.getUnreadCount());

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/notifications/unread-count'
          )
      );

    request.flush({
      count: 3
    });

    await promise;

    expect(values.at(-1)).toBe(3);

    subscription.unsubscribe();
  });

  it('should decrement unread count after marking one notification as read', async () => {

    const countPromise =
      firstValueFrom(service.getUnreadCount());

    httpTesting
      .expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/notifications/unread-count'
          )
      )
      .flush({
        count: 2
      });

    await countPromise;

    const markPromise =
      firstValueFrom(
        service.markAsRead('notification-1')
      );

    httpTesting
      .expectOne(
        req =>
          req.method === 'PATCH' &&
          req.url.endsWith(
            '/notifications/notification-1/read'
          )
      )
      .flush({
        message: 'ok'
      });

    await markPromise;

    let currentCount = -1;

    const subscription =
      service.unreadCount$
        .subscribe(
          count => currentCount = count
        );

    expect(currentCount).toBe(1);

    subscription.unsubscribe();
  });

  it('should reset unread count after marking all notifications as read', async () => {

    const countPromise =
      firstValueFrom(service.getUnreadCount());

    httpTesting
      .expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/notifications/unread-count'
          )
      )
      .flush({
        count: 4
      });

    await countPromise;

    const markPromise =
      firstValueFrom(service.markAllAsRead());

    httpTesting
      .expectOne(
        req =>
          req.method === 'PATCH' &&
          req.url.endsWith(
            '/notifications/read-all'
          )
      )
      .flush({
        message: 'ok'
      });

    await markPromise;

    let currentCount = -1;

    const subscription =
      service.unreadCount$
        .subscribe(
          count => currentCount = count
        );

    expect(currentCount).toBe(0);

    subscription.unsubscribe();
  });

  it('should decrement unread count when deleting an unread notification', async () => {

    const countPromise =
      firstValueFrom(service.getUnreadCount());

    httpTesting
      .expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/notifications/unread-count'
          )
      )
      .flush({
        count: 2
      });

    await countPromise;

    const deletePromise =
      firstValueFrom(
        service.delete(
          'notification-1',
          true
        )
      );

    httpTesting
      .expectOne(
        req =>
          req.method === 'DELETE' &&
          req.url.endsWith(
            '/notifications/notification-1'
          )
      )
      .flush(null);

    await deletePromise;

    let currentCount = -1;

    const subscription =
      service.unreadCount$
        .subscribe(
          count => currentCount = count
        );

    expect(currentCount).toBe(1);

    subscription.unsubscribe();
  });
});
