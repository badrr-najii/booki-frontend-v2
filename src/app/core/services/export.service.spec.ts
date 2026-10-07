import {
  TestBed
} from '@angular/core/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  API_BASE_URL
} from '../config/api.config';

import {
  ExportService
} from './export.service';

describe('ExportService', () => {
  let service: ExportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExportService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(ExportService);

    httpMock =
      TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should export bookings as blob', () => {
    const blob =
      new Blob(['file']);

    service.export(
      'bookings',
      {
        salonId: 'salon-1',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        format: 'excel',
        type: 'bookings'
      }
    ).subscribe(result => {
      expect(result).toEqual(blob);
    });

    const request =
      httpMock.expectOne(
        `${API_BASE_URL}/Export/bookings`
      );

    expect(request.request.method)
      .toBe('POST');

    expect(request.request.responseType)
      .toBe('blob');

    expect(request.request.body)
      .toEqual({
        salonId: 'salon-1',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        format: 'excel',
        type: 'bookings'
      });

    request.flush(blob);
  });

  it('should export payments as pdf', () => {
    service.export(
      'payments',
      {
        salonId: 'salon-1',
        format: 'pdf',
        type: 'payments'
      }
    ).subscribe();

    const request =
      httpMock.expectOne(
        `${API_BASE_URL}/Export/payments`
      );

    expect(request.request.body)
      .toEqual({
        salonId: 'salon-1',
        format: 'pdf',
        type: 'payments'
      });

    request.flush(
      new Blob(['pdf'])
    );
  });
});