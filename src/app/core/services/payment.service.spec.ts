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
  PaymentMethod,
  PaymentService,
  PaymentStatus
} from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(PaymentService);

    httpTesting =
      TestBed.inject(HttpTestingController);
  });

  it('should load salon payments', async () => {
    const promise =
      firstValueFrom(
        service.getBySalon('salon-1')
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'GET' &&
          req.url.endsWith(
            '/Payments/salon/salon-1'
          )
      );

    request.flush([
      {
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
      }
    ]);

    const payments = await promise;

    expect(payments).toHaveLength(1);
    expect(payments[0].paymentId)
      .toBe('payment-1');
  });

  it('should create a card checkout', async () => {
    const promise =
      firstValueFrom(
        service.createCardCheckout(
          'booking-1'
        )
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'POST' &&
          req.url.endsWith('/Payments')
      );

    expect(request.request.body)
      .toEqual({
        bookingId: 'booking-1',
        method: PaymentMethod.Card
      });

    request.flush({
      paymentId: 'payment-1',
      bookingId: 'booking-1',
      paymentIntentId: null,
      redirectUrl:
        'https://checkout.stripe.test/session',
      status: PaymentStatus.Pending,
      amount: 150,
      currency: 'MAD',
      createdAt: '2026-10-06T10:00:00Z',
      paidAt: null,
      refundedAt: null
    });

    const payment = await promise;

    expect(payment.redirectUrl)
      .toBe(
        'https://checkout.stripe.test/session'
      );
  });

  it('should refund a payment', async () => {
    const promise =
      firstValueFrom(
        service.refund('payment-1')
      );

    const request =
      httpTesting.expectOne(
        req =>
          req.method === 'POST' &&
          req.url.endsWith(
            '/Payments/payment-1/refund'
          )
      );

    expect(request.request.body)
      .toEqual({});

    request.flush({
      paymentId: 'payment-1',
      bookingId: 'booking-1',
      paymentIntentId: 'pi_1',
      redirectUrl: null,
      status: PaymentStatus.Refunded,
      amount: 150,
      currency: 'MAD',
      createdAt: '2026-10-06T10:00:00Z',
      paidAt: '2026-10-06T10:05:00Z',
      refundedAt: '2026-10-06T11:00:00Z'
    });

    const payment = await promise;

    expect(payment.status)
      .toBe(PaymentStatus.Refunded);
  });
});
