
import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  of,
  Subject,
  throwError
} from 'rxjs';

import {
  vi
} from 'vitest';

import {
  Home
} from './home';

import {
  SalonService,
  PublicSalonResponse,
  SalonAudience
} from '../../../../core/services/salon.service';

import {
  Hero
} from '../../components/hero/hero';

import {
  PopularSalons
} from '../../components/popular-salons/popular-salons';

import { By } from '@angular/platform-browser';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;

  let getAllPublic: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getAllPublic = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: SalonService,
          useValue: { getAllPublic }
        }
      ]
    }).compileComponents();
  });

  async function createHome(): Promise<void> {
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  it('should request public salons once', async () => {
    getAllPublic.mockReturnValue(of([]));

    await createHome();

    expect(getAllPublic).toHaveBeenCalledTimes(1);
  });

  it('should share salons with Hero and PopularSalons', async () => {
    const salons: PublicSalonResponse[] = [
      {
        id: 'salon-1',
        name: 'Salon Test',
        slug: 'salon-test',
        audience: SalonAudience.Mixed,
        services: []
      }
    ];

    getAllPublic.mockReturnValue(of(salons));

    await createHome();

    const hero = fixture.debugElement
  .query(By.directive(Hero))
  .componentInstance as Hero;

const popular = fixture.debugElement
  .query(By.directive(PopularSalons))
  .componentInstance as PopularSalons;

    expect(hero.salons).toBe(salons);
    expect(popular.salons).toBe(salons);
    expect(component.isLoading).toBe(false);
  });

  it('should remain loading until the API responds', async () => {
    const response$ = new Subject<PublicSalonResponse[]>();

    getAllPublic.mockReturnValue(response$.asObservable());

    await createHome();

    expect(component.isLoading).toBe(true);

    response$.next([]);
    response$.complete();

    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(component.isLoading).toBe(false);
  });

  it('should propagate API errors to both components', async () => {
    getAllPublic.mockReturnValue(
      throwError(() => new Error('API unavailable'))
    );

    await createHome();

   const hero = fixture.debugElement
  .query(By.directive(Hero))
  .componentInstance as Hero;

const popular = fixture.debugElement
  .query(By.directive(PopularSalons))
  .componentInstance as PopularSalons;

    expect(component.loadFailed).toBe(true);
    expect(component.isLoading).toBe(false);
    expect(hero.loadFailed).toBe(true);
    expect(popular.loadFailed).toBe(true);
  });
});
