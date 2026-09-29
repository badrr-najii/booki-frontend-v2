import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import {
  TestBed
} from '@angular/core/testing';

import {
  Router
} from '@angular/router';

import {
  firstValueFrom,
  of,
  Subject,
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
  AuthService
} from '../services/auth.service';

import {
  authInterceptor
} from './auth.interceptor';

describe('authInterceptor', () => {

  let authService: {
    getAccessToken: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {

    authService = {
      getAccessToken: vi.fn(),
      refreshToken: vi.fn(),
      clearSession: vi.fn()
    };

    router = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authService
        },
        {
          provide: Router,
          useValue: router
        }
      ]
    });
  });

  it('should attach the current access token', async () => {

    authService.getAccessToken
      .mockReturnValue('access-token');

    const request =
      new HttpRequest(
        'GET',
        '/api/Notifications'
      );

    const next = vi.fn((req: HttpRequest<unknown>) =>
      of(
        new HttpResponse({
          status: 200,
          body: req.headers.get('Authorization')
        })
      )
    );

    const response =
      await firstValueFrom(
        TestBed.runInInjectionContext(
          () => authInterceptor(request, next)
        )
      ) as HttpResponse<string>;

    expect(response.body)
      .toBe('Bearer access-token');

    expect(next)
      .toHaveBeenCalledTimes(1);
  });

  it('should clear the session when refresh fails after a 401', async () => {

    authService.getAccessToken
      .mockReturnValue('stale-token');

    authService.refreshToken
      .mockReturnValue(
        throwError(
          () => new HttpErrorResponse({
            status: 401
          })
        )
      );

    const request =
      new HttpRequest(
        'GET',
        '/api/Notifications'
      );

    const next = vi.fn(() =>
      throwError(
        () => new HttpErrorResponse({
          status: 401
        })
      )
    );

    await expect(
      firstValueFrom(
        TestBed.runInInjectionContext(
          () => authInterceptor(request, next)
        )
      )
    ).rejects.toBeTruthy();

    expect(authService.refreshToken)
      .toHaveBeenCalledTimes(1);

    expect(authService.clearSession)
      .toHaveBeenCalledTimes(1);

    expect(router.navigate)
      .toHaveBeenCalledWith(['/login']);
  });

  it('should retry the request with the refreshed access token', async () => {

    authService.getAccessToken
      .mockReturnValueOnce('stale-token')
      .mockReturnValue('new-access-token');

    authService.refreshToken
      .mockReturnValue(
        of({
          accessToken: 'new-access-token'
        })
      );

    const request =
      new HttpRequest(
        'GET',
        '/api/Notifications'
      );

    let calls = 0;

    const next = vi.fn((req: HttpRequest<unknown>) => {

      calls++;

      if (calls === 1) {
        return throwError(
          () => new HttpErrorResponse({
            status: 401
          })
        );
      }

      return of(
        new HttpResponse({
          status: 200,
          body: req.headers.get('Authorization')
        })
      );
    });

    const response =
      await firstValueFrom(
        TestBed.runInInjectionContext(
          () => authInterceptor(request, next)
        )
      ) as HttpResponse<string>;

    expect(authService.refreshToken)
      .toHaveBeenCalledTimes(1);

    expect(next)
      .toHaveBeenCalledTimes(2);

    expect(response.body)
      .toBe('Bearer new-access-token');
  });

  it('should use one refresh request for concurrent 401 responses', async () => {

    authService.getAccessToken
      .mockReturnValue('stale-token');

    const refresh$ =
      new Subject<{
        accessToken: string;
      }>();

    authService.refreshToken
      .mockReturnValue(refresh$);

    const createNext = () => {

      let calls = 0;

      return vi.fn((req: HttpRequest<unknown>) => {

        calls++;

        if (calls === 1) {
          return throwError(
            () => new HttpErrorResponse({
              status: 401
            })
          );
        }

        return of(
          new HttpResponse({
            status: 200,
            body: req.headers.get('Authorization')
          })
        );
      });
    };

    const request1 =
      new HttpRequest(
        'GET',
        '/api/Notifications'
      );

    const request2 =
      new HttpRequest(
        'GET',
        '/api/Dashboard'
      );

    const next1 = createNext();
    const next2 = createNext();

    const response1 =
      firstValueFrom(
        TestBed.runInInjectionContext(
          () => authInterceptor(request1, next1)
        )
      );

    const response2 =
      firstValueFrom(
        TestBed.runInInjectionContext(
          () => authInterceptor(request2, next2)
        )
      );

    expect(authService.refreshToken)
      .toHaveBeenCalledTimes(1);

    authService.getAccessToken
      .mockReturnValue('new-access-token');

    refresh$.next({
      accessToken: 'new-access-token'
    });

    refresh$.complete();

    await Promise.all([
      response1,
      response2
    ]);

    expect(authService.refreshToken)
      .toHaveBeenCalledTimes(1);

    expect(next1)
      .toHaveBeenCalledTimes(2);

    expect(next2)
      .toHaveBeenCalledTimes(2);
  });
});