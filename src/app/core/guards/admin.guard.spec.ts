import { TestBed } from '@angular/core/testing';
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
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth.models';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {

  let authService: {
    isAdmin: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  let router: Router;

  beforeEach(() => {
    authService = {
      isAdmin: vi.fn(),
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

  it('should allow access when the user is an admin', () => {
    authService.isAdmin.mockReturnValue(true);

    const result =
      TestBed.runInInjectionContext(
        () => adminGuard({} as any, {} as any)
      );

    expect(result).toBe(true);
    expect(authService.refreshToken)
      .not.toHaveBeenCalled();
  });

  it('should redirect an authenticated non-admin to home', () => {
    authService.isAdmin.mockReturnValue(false);
    authService.isAuthenticated.mockReturnValue(true);

    const result =
      TestBed.runInInjectionContext(
        () => adminGuard({} as any, {} as any)
      ) as UrlTree;

    expect(router.serializeUrl(result))
      .toBe('/');

    expect(authService.refreshToken)
      .not.toHaveBeenCalled();
  });

  it('should allow access when refresh restores an admin session', async () => {
    authService.isAdmin
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    authService.isAuthenticated.mockReturnValue(false);

    const response: AuthResponse = {
      accessToken: 'new-access-token',
      expiresAt: '',
      userName: '',
      email: '',
      role: 'Admin',
      isEmailConfirmed: true
    };

    authService.refreshToken.mockReturnValue(
      of(response)
    );

    const result =
      TestBed.runInInjectionContext(
        () => adminGuard({} as any, {} as any)
      ) as Observable<boolean | UrlTree>;

    expect(await firstValueFrom(result))
      .toBe(true);
  });

  it('should redirect to home when refresh restores a non-admin session', async () => {
    authService.isAdmin.mockReturnValue(false);
    authService.isAuthenticated.mockReturnValue(false);

    const response: AuthResponse = {
      accessToken: 'new-access-token',
      expiresAt: '',
      userName: '',
      email: '',
      role: 'Owner',
      isEmailConfirmed: true
    };

    authService.refreshToken.mockReturnValue(
      of(response)
    );

    const result =
      TestBed.runInInjectionContext(
        () => adminGuard({} as any, {} as any)
      ) as Observable<boolean | UrlTree>;

    const value =
      await firstValueFrom(result);

    expect(value instanceof UrlTree)
      .toBe(true);

    expect(router.serializeUrl(value as UrlTree))
      .toBe('/');
  });

  it('should redirect to login when refresh fails', async () => {
    authService.isAdmin.mockReturnValue(false);
    authService.isAuthenticated.mockReturnValue(false);

    authService.refreshToken.mockReturnValue(
      throwError(() => new Error('Refresh failed'))
    );

    const result =
      TestBed.runInInjectionContext(
        () => adminGuard({} as any, {} as any)
      ) as Observable<boolean | UrlTree>;

    const value =
      await firstValueFrom(result);

    expect(value instanceof UrlTree)
      .toBe(true);

    expect(router.serializeUrl(value as UrlTree))
      .toBe('/login');

    expect(authService.clearSession)
      .toHaveBeenCalledTimes(1);
  });
});