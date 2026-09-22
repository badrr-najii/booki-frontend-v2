import {
  TestBed
} from '@angular/core/testing';

import {
  provideRouter,
  Router,
  UrlTree
} from '@angular/router';

import {
  firstValueFrom,
  Observable,
  of,
  throwError
} from 'rxjs';

import {
  describe,
  beforeEach,
  expect,
  it,
  vi
} from 'vitest';

import {
  AuthService
} from '../services/auth.service';

import {
  AuthResponse
} from '../models/auth.models';

import {
  authGuard
} from './auth.guard';

describe('authGuard', () => {

  let authService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  let router: Router;

  beforeEach(() => {

    authService = {
      isAuthenticated: vi.fn(),
      refreshToken: vi.fn(),
      clearSession: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authService
        }
      ]
    });

    router = TestBed.inject(Router);
  });

  it(
    'should allow access when the access token is valid',
    () => {

      authService
        .isAuthenticated
        .mockReturnValue(true);

      const result =
        TestBed.runInInjectionContext(
          () => authGuard({} as any, {} as any)
        );

      expect(result).toBe(true);

      expect(
        authService.refreshToken
      ).not.toHaveBeenCalled();
    }
  );

  it(
    'should restore the session when refresh succeeds',
    async () => {

      authService
        .isAuthenticated
        .mockReturnValue(false);

      const response: AuthResponse = {
        accessToken: 'new-access-token',
        expiresAt: '',
        userName: '',
        email: '',
        role: '',
        isEmailConfirmed: true
      };

      authService
        .refreshToken
        .mockReturnValue(
          of(response)
        );

      const result =
        TestBed.runInInjectionContext(
          () => authGuard({} as any, {} as any)
        ) as Observable<boolean | UrlTree>;

      const value =
        await firstValueFrom(result);

      expect(value).toBe(true);

      expect(
        authService.refreshToken
      ).toHaveBeenCalledTimes(1);

      expect(
        authService.clearSession
      ).not.toHaveBeenCalled();
    }
  );

  it(
    'should redirect to login when refresh fails',
    async () => {

      authService
        .isAuthenticated
        .mockReturnValue(false);

      authService
        .refreshToken
        .mockReturnValue(
          throwError(
            () => new Error('Refresh failed')
          )
        );

      const result =
        TestBed.runInInjectionContext(
          () => authGuard({} as any, {} as any)
        ) as Observable<boolean | UrlTree>;

      const value =
        await firstValueFrom(result);

      expect(value instanceof UrlTree)
        .toBe(true);

      expect(
        router.serializeUrl(
          value as UrlTree
        )
      ).toBe('/login');

      expect(
        authService.clearSession
      ).toHaveBeenCalledTimes(1);
    }
  );
});