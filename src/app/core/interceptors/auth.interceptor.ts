import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError
} from 'rxjs';

import {
  AuthService
} from '../services/auth.service';

let isRefreshing = false;

const refreshTokenSubject =
  new BehaviorSubject<string | null>(null);

let refreshFailed = false;

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);

    const isAuthEndpoint =
      req.url.includes('/api/auth/login') ||
      req.url.includes('/api/auth/register') ||
      req.url.includes('/api/auth/logout') ||
      req.url.includes('/api/auth/refresh-token');

    if (isAuthEndpoint) {
      return next(req);
    }

    const accessToken =
      authService.getAccessToken();

    const authRequest =
      accessToken
        ? req.clone({
          setHeaders: {
            Authorization:
              `Bearer ${accessToken}`
          }
        })
        : req;

    return next(authRequest).pipe(

      catchError(
        (error: HttpErrorResponse) => {

          if (error.status !== 401) {
            return throwError(
              () => error
            );
          }

          if (!isRefreshing) {

            isRefreshing = true;
            refreshFailed = false;

            refreshTokenSubject.next(
              null
            );

            return authService
              .refreshToken()
              .pipe(

                switchMap(() => {

                  isRefreshing = false;
                  refreshFailed = false;

                  const newAccessToken =
                    authService
                      .getAccessToken();

                  if (!newAccessToken) {

                    authService
                      .clearSession();

                    router.navigate([
                      '/login'
                    ]);

                    return throwError(
                      () => error
                    );
                  }

                  refreshTokenSubject.next(
                    newAccessToken
                  );

                  const retryRequest =
                    req.clone({
                      setHeaders: {
                        Authorization:
                          `Bearer ${newAccessToken}`
                      }
                    });

                  return next(
                    retryRequest
                  );
                }),

                catchError(
                  refreshError => {

                    isRefreshing = false;
                    refreshFailed = true;

                    refreshTokenSubject.next(
                      null
                    );

                    authService
                      .clearSession();

                    router.navigate([
                      '/login'
                    ]);

                    return throwError(
                      () => refreshError
                    );
                  }
                )
              );
          }

          return refreshTokenSubject.pipe(

            filter(
              token =>
                token !== null ||
                refreshFailed
            ),

            take(1),

            switchMap(
              newAccessToken => {

                if (
                  refreshFailed ||
                  !newAccessToken
                ) {
                  return throwError(
                    () => error
                  );
                }

                const retryRequest =
                  req.clone({
                    setHeaders: {
                      Authorization:
                        `Bearer ${newAccessToken}`
                    }
                  });

                return next(
                  retryRequest
                );
              }
            )
          );
        }
      )
    );
  };