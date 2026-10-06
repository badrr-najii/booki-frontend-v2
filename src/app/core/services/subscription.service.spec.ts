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
  SubscriptionPlan,
  SubscriptionService
} from './subscription.service';

describe('SubscriptionService', () => {

  let service: SubscriptionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(SubscriptionService);

    httpTesting =
      TestBed.inject(HttpTestingController);
  });

  it('should load available plans', async () => {

    const promise =
      firstValueFrom(
        service.getAvailablePlans()
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/subscriptions/plans'
          )
      );

    request.flush([
      {
        plan: SubscriptionPlan.Free,
        name: 'Free',
        price: 0,
        currency: 'MAD',
        maxSalons: 1,
        maxEmployees: 2,
        maxBookingsPerMonth: 20,
        isPopular: false,
        features: [
          '1 salon'
        ]
      }
    ]);

    const plans = await promise;

    expect(plans).toHaveLength(1);

    expect(
      plans[0].plan
    ).toBe(
      SubscriptionPlan.Free
    );
  });

  it('should load current salon subscription', async () => {

    const promise =
      firstValueFrom(
        service.getCurrent('salon-1')
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/subscriptions/salon/salon-1/current'
          )
      );

    request.flush({
      id: 'subscription-1',
      salonId: 'salon-1',
      salonName: 'Runtime Salon',
      plan: SubscriptionPlan.Free,
      planName: 'Free',
      status: 0,
      statusName: 'Active',
      startDate: '2026-10-06T10:00:00Z',
      endDate: '2036-10-06T10:00:00Z',
      isActive: true,
      isExpired: false,
      price: 0,
      currency: 'MAD',
      limits: {
        plan: SubscriptionPlan.Free,
        name: 'Free',
        price: 0,
        maxSalons: 1,
        maxEmployees: 2,
        maxBookingsPerMonth: 20,
        hasAdvancedStats: false,
        hasExport: false,
        hasApiAccess: false,
        hasPrioritySupport: false,
        hasVipSupport: false,
        hasCustomIntegration: false,
        hasNoCommission: false
      }
    });

    const subscription =
      await promise;

    expect(
      subscription.salonId
    ).toBe(
      'salon-1'
    );

    expect(
      subscription.plan
    ).toBe(
      SubscriptionPlan.Free
    );
  });

  it('should create a free subscription', async () => {

    const promise =
      firstValueFrom(
        service.createFree('salon-1')
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'POST' &&
          req.url.endsWith(
            '/subscriptions'
          )
      );

    expect(
      request.request.body
    ).toEqual({
      salonId: 'salon-1',
      plan: SubscriptionPlan.Free
    });

    request.flush({
      id: 'subscription-1',
      salonId: 'salon-1'
    });

    const subscription =
      await promise;

    expect(
      subscription.id
    ).toBe(
      'subscription-1'
    );
  });

  it('should load remaining bookings', async () => {

    const promise =
      firstValueFrom(
        service.getRemainingBookings(
          'salon-1'
        )
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/subscriptions/salon-1/remaining-bookings'
          )
      );

    request.flush({
      remaining: 17
    });

    expect(
      await promise
    ).toBe(17);
  });

  it('should check if another employee can be added', async () => {

    const promise =
      firstValueFrom(
        service.canAddEmployee(
          'salon-1'
        )
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/subscriptions/salon-1/can-add-employee'
          )
      );

    request.flush({
      canAdd: true
    });

    expect(
      await promise
    ).toBe(true);
  });

  it('should check if another salon can be added', async () => {

    const promise =
      firstValueFrom(
        service.canAddSalon(
          'salon-1'
        )
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/subscriptions/salon-1/can-add-salon'
          )
      );

    request.flush({
      canAdd: false
    });

    expect(
      await promise
    ).toBe(false);
  });
});