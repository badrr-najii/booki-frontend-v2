import {
  ChangeDetectorRef
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  of,
  throwError
} from 'rxjs';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  SalonAudience,
  SalonService
} from '../../../../core/services/salon.service';

import {
  SubscriptionPlan,
  SubscriptionService
} from '../../../../core/services/subscription.service';

import {
  OwnerSubscription
} from './owner-subscription';

describe('OwnerSubscription', () => {

  let route: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };

  let salonService: {
    getById: ReturnType<typeof vi.fn>;
  };

  let subscriptionService: {
    getAvailablePlans: ReturnType<typeof vi.fn>;
    getCurrent: ReturnType<typeof vi.fn>;
    createFree: ReturnType<typeof vi.fn>;
    getRemainingBookings: ReturnType<typeof vi.fn>;
    canAddEmployee: ReturnType<typeof vi.fn>;
  };

  let cdr: {
    detectChanges: ReturnType<typeof vi.fn>;
  };

  let component: OwnerSubscription;

  const salon = {
    id: 'salon-1',
    name: 'Runtime Salon',
    slug: 'runtime-salon',
    description: null,
    address: null,
    city: 'Casablanca',
    phoneNumber: null,
    email: null,
    logoUrl: null,
    audience: SalonAudience.Mixed,
    latitude: null,
    longitude: null,
    ownerId: 'owner-1',
    ownerName: 'Owner',
    isActive: true,
    createdAt: '2026-10-06T10:00:00Z'
  };

  const freePlan = {
    plan: SubscriptionPlan.Free,
    name: 'Free',
    price: 0,
    currency: 'MAD',
    maxSalons: 1,
    maxEmployees: 2,
    maxBookingsPerMonth: 20,
    isPopular: false,
    features: [
      '1 salon',
      '2 employés',
      '20 réservations/mois'
    ]
  };

  const subscription = {
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
  };

  beforeEach(() => {

    route = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('salon-1')
        }
      }
    };

    salonService = {
      getById: vi.fn()
    };

    subscriptionService = {
      getAvailablePlans: vi.fn(),
      getCurrent: vi.fn(),
      createFree: vi.fn(),
      getRemainingBookings: vi.fn(),
      canAddEmployee: vi.fn()
    };

    cdr = {
      detectChanges: vi.fn()
    };

    component = new OwnerSubscription(
      route as unknown as ActivatedRoute,
      salonService as unknown as SalonService,
      subscriptionService as unknown as SubscriptionService,
      cdr as unknown as ChangeDetectorRef
    );
  });

  it('should load salon, plans, current subscription and usage', () => {

    salonService.getById
      .mockReturnValue(of(salon));

    subscriptionService.getAvailablePlans
      .mockReturnValue(of([freePlan]));

    subscriptionService.getCurrent
      .mockReturnValue(of(subscription));

    subscriptionService.getRemainingBookings
      .mockReturnValue(of(17));

    subscriptionService.canAddEmployee
      .mockReturnValue(of(true));

    component.ngOnInit();

    expect(component.salon)
      .toEqual(salon);

    expect(component.plans)
      .toEqual([freePlan]);

    expect(component.subscription)
      .toEqual(subscription);

    expect(component.remainingBookings)
      .toBe(17);

    expect(component.canAddEmployee)
      .toBe(true);

    expect(component.isLoading)
      .toBe(false);
  });

  it('should allow an owner without a subscription to activate Free', () => {

    component.salon = salon;

    subscriptionService.createFree
      .mockReturnValue(of(subscription));

    subscriptionService.getRemainingBookings
      .mockReturnValue(of(20));

    subscriptionService.canAddEmployee
      .mockReturnValue(of(true));

    component.createFreeSubscription();

    expect(
      subscriptionService.createFree
    ).toHaveBeenCalledWith('salon-1');

    expect(component.subscription)
      .toEqual(subscription);

    expect(component.successMessage)
      .toBe(
        'Votre abonnement gratuit est maintenant actif.'
      );

    expect(component.isCreatingFree)
      .toBe(false);
  });

  it('should treat a missing current subscription as an empty state', () => {

    salonService.getById
      .mockReturnValue(of(salon));

    subscriptionService.getAvailablePlans
      .mockReturnValue(of([freePlan]));

    subscriptionService.getCurrent
      .mockReturnValue(
        throwError(() => ({
          status: 404
        }))
      );

    component.ngOnInit();

    expect(component.subscription)
      .toBeNull();

    expect(component.errorMessage)
      .toBe('');

    expect(component.isLoading)
      .toBe(false);
  });

  it('should identify the current plan', () => {

    component.subscription = subscription;

    expect(
      component.isCurrentPlan(freePlan)
    ).toBe(true);

    expect(
      component.isCurrentPlan({
        ...freePlan,
        plan: SubscriptionPlan.Pro,
        name: 'Pro'
      })
    ).toBe(false);
  });

  it('should identify paid plans', () => {

    expect(
      component.isPaidPlan(freePlan)
    ).toBe(false);

    expect(
      component.isPaidPlan({
        ...freePlan,
        plan: SubscriptionPlan.Pro,
        name: 'Pro',
        price: 399
      })
    ).toBe(true);
  });
});
