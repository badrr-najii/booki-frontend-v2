import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ActivatedRoute
} from '@angular/router';

import {
  of,
  throwError
} from 'rxjs';

import {
  OwnerExport
} from './owner-export';

import {
  SalonService
} from '../../../../core/services/salon.service';

import {
  ExportService
} from '../../../../core/services/export.service';

describe('OwnerExport', () => {
  let fixture: ComponentFixture<OwnerExport>;
  let component: OwnerExport;

  let salonService: {
    getById: ReturnType<typeof vi.fn>;
  };

  let exportService: {
    export: ReturnType<typeof vi.fn>;
  };

  const salon = {
    id: 'salon-1',
    ownerId: 'owner-1',
    name: 'Booki Salon',
    description: 'Test salon',
    address: 'Casablanca',
    city: 'Casablanca',
    phone: '0600000000',
    email: 'salon@test.com',
    logoUrl: null,
    isActive: true,
    createdAt: '2026-10-01T00:00:00Z'
  } as any;

  beforeEach(async () => {
    salonService = {
      getById: vi.fn()
        .mockReturnValue(of(salon))
    };

    exportService = {
      export: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        OwnerExport
      ],
      providers: [
        {
          provide: SalonService,
          useValue: salonService
        },
        {
          provide: ExportService,
          useValue: exportService
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn()
                  .mockReturnValue('salon-1')
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(OwnerExport);

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should load the salon', () => {
    expect(
      salonService.getById
    ).toHaveBeenCalledWith('salon-1');

    expect(component.salon)
      .toEqual(salon);

    expect(component.isLoading)
      .toBe(false);
  });

  it('should export bookings with date filters', () => {
    const blob =
      new Blob(['excel']);

    exportService.export
      .mockReturnValue(of(blob));

    const downloadSpy =
      vi.spyOn(component, 'download')
        .mockImplementation(() => {});

    component.format = 'excel';
    component.startDate = '2026-10-01';
    component.endDate = '2026-10-31';

    const option =
      component.options.find(
        item => item.type === 'bookings'
      )!;

    component.exportData(option);

    expect(
      exportService.export
    ).toHaveBeenCalledWith(
      'bookings',
      {
        salonId: 'salon-1',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        format: 'excel',
        type: 'bookings'
      }
    );

    expect(downloadSpy)
      .toHaveBeenCalledWith(
        blob,
        'bookings',
        'excel'
      );

    expect(component.successMessage)
      .toBe(
        'Export téléchargé avec succès.'
      );

    expect(component.exportingType)
      .toBeNull();
  });

  it('should not send dates for employees', () => {
    const blob =
      new Blob(['pdf']);

    exportService.export
      .mockReturnValue(of(blob));

    vi.spyOn(component, 'download')
      .mockImplementation(() => {});

    component.format = 'pdf';
    component.startDate = '2026-10-01';
    component.endDate = '2026-10-31';

    const option =
      component.options.find(
        item => item.type === 'employees'
      )!;

    component.exportData(option);

    expect(
      exportService.export
    ).toHaveBeenCalledWith(
      'employees',
      {
        salonId: 'salon-1',
        startDate: null,
        endDate: null,
        format: 'pdf',
        type: 'employees'
      }
    );
  });

  it('should reject an invalid date range locally', () => {
    component.startDate = '2026-10-31';
    component.endDate = '2026-10-01';

    const option =
      component.options.find(
        item => item.type === 'payments'
      )!;

    component.exportData(option);

    expect(
      exportService.export
    ).not.toHaveBeenCalled();

    expect(component.errorMessage)
      .toContain(
        'date de début'
      );
  });

  it('should show an error when export fails', () => {
    exportService.export
      .mockReturnValue(
        throwError(
          () => new Error('Export failed')
        )
      );

    const option =
      component.options.find(
        item => item.type === 'services'
      )!;

    component.exportData(option);

    expect(component.errorMessage)
      .toBe(
        'Impossible de générer cet export.'
      );

    expect(component.exportingType)
      .toBeNull();
  });

  it('should show an error when salon loading fails', async () => {
    salonService.getById
      .mockReturnValue(
        throwError(
          () => new Error('Load failed')
        )
      );

    const localFixture =
      TestBed.createComponent(OwnerExport);

    localFixture.detectChanges();

    const localComponent =
      localFixture.componentInstance;

    expect(localComponent.salon)
      .toBeNull();

    expect(localComponent.isLoading)
      .toBe(false);

    expect(localComponent.errorMessage)
      .toBe(
        'Impossible de charger le salon.'
      );
  });
});