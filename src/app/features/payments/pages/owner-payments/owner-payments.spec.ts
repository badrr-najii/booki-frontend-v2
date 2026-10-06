import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ActivatedRoute,
  convertToParamMap
} from '@angular/router';

import {
  of,
  throwError
} from 'rxjs';

import {
  describe,
  expect,
  it,
  beforeEach,
  vi
} from 'vitest';

import {
  BookingService,
  BookingStatus
} from '../../../../core/services/booking.service';

import {
  PaymentService,
  PaymentStatus
} from '../../../../core/services/payment.service';

import {
  SalonService
} from '../../../../core/services/salon.service';

import {
  OwnerPayments
} from './owner-payments';

describe('OwnerPayments', () => {
  let fixture: ComponentFixture<OwnerPayments>;
  let component: OwnerPayments;

  let salonService: {
    getById: ReturnType<typeof vi.fn>;
  };

  let bookingService: {
    getBySalon: ReturnType<typeof vi.fn>;
  };

  let paymentService: {
    getBySalon: ReturnType<typeof vi.fn>;
    createCardCheckout: ReturnType<typeof vi.fn>;
    refund: ReturnType<typeof vi.fn>;
  };

  const salon = {
    id: 'salon-1',
    name: 'Booki Salon'
  } as any;

  const confirmedBooking = {
    id: 'booking-1',
    salonId: 'salon-1',
    clientName: 'Sara',
    clientEmail: 'sara@test.com',
    serviceName: 'Coupe',
    servicePrice: 150,
    bookingDate: '2026-10-10T00:00:00',
    startTime: '10:00:00',
    endTime: '11:00:00',
    status: BookingStatus.Confirmed
  } as any;

  const paidPayment = {
    paymentId: 'payment-1',
    bookingId: 'booking-1',
    paymentIntentId: 'pi_1',
    redirectUrl: null,
    status: PaymentStatus.Paid,
    amount: 150,
    currency: 'MAD',
    createdAt: '2026-10-06T10:00:00Z',
    paidAt: '2026-10-06T10:05:00Z',
    refundedAt: null
  };

  beforeEach(async () => {
    salonService = {
      getById: vi.fn(() => of(salon))
    };

    bookingService = {
      getBySalon:
        vi.fn(() => of([confirmedBooking]))
    };

    paymentService = {
      getBySalon: vi.fn(() => of([])),
      createCardCheckout: vi.fn(),
      refund: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [OwnerPayments],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap:
                convertToParamMap({
                  id: 'salon-1'
                })
            }
          }
        },
        {
          provide: SalonService,
          useValue: salonService
        },
        {
          provide: BookingService,
          useValue: bookingService
        },
        {
          provide: PaymentService,
          useValue: paymentService
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(OwnerPayments);

    component = fixture.componentInstance;
  });

  it('should load salon, bookings and payments', () => {
    fixture.detectChanges();

    expect(salonService.getById)
      .toHaveBeenCalledWith('salon-1');

    expect(bookingService.getBySalon)
      .toHaveBeenCalledWith('salon-1');

    expect(paymentService.getBySalon)
      .toHaveBeenCalledWith('salon-1');

    expect(component.salon)
      .toEqual(salon);

    expect(component.bookings)
      .toEqual([confirmedBooking]);

    expect(component.isLoading)
      .toBe(false);
  });

  it('should allow checkout for a confirmed booking without blocking payment', () => {
    fixture.detectChanges();

    expect(
      component.canCreateCheckout(
        confirmedBooking
      )
    ).toBe(true);
  });

  it('should block checkout when booking has a pending payment', () => {
    paymentService.getBySalon.mockReturnValue(
      of([
        {
          ...paidPayment,
          status: PaymentStatus.Pending
        }
      ])
    );

    fixture.detectChanges();

    expect(
      component.canCreateCheckout(
        confirmedBooking
      )
    ).toBe(false);
  });

  it('should allow checkout retry after a failed payment', () => {
    paymentService.getBySalon.mockReturnValue(
      of([
        {
          ...paidPayment,
          status: PaymentStatus.Failed
        }
      ])
    );

    fixture.detectChanges();

    expect(
      component.canCreateCheckout(
        confirmedBooking
      )
    ).toBe(true);
  });

  it('should update payment after refund', () => {
    paymentService.getBySalon.mockReturnValue(
      of([paidPayment])
    );

    const refunded = {
      ...paidPayment,
      status: PaymentStatus.Refunded,
      refundedAt:
        '2026-10-06T11:00:00Z'
    };

    paymentService.refund.mockReturnValue(
      of(refunded)
    );

    vi.spyOn(window, 'confirm')
      .mockReturnValue(true);

    fixture.detectChanges();

    component.refund(paidPayment);

    expect(paymentService.refund)
      .toHaveBeenCalledWith('payment-1');

    expect(component.payments[0].status)
      .toBe(PaymentStatus.Refunded);

    expect(component.refundingPaymentId)
      .toBeNull();
  });

  it('should show an error when initial loading fails', () => {
    paymentService.getBySalon.mockReturnValue(
      throwError(() => new Error('API error'))
    );

    fixture.detectChanges();

    expect(component.isLoading)
      .toBe(false);

    expect(component.errorMessage)
      .toBe(
        'Impossible de charger les paiements du salon.'
      );
  });
});
