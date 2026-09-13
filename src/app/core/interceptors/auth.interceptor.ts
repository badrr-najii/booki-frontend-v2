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

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);

    if (
      req.url.includes('/api/auth/refresh-token')
    ) {
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

          const refreshToken =
            authService.getRefreshToken();

          if (!refreshToken) {

            authService.clearSession();

            router.navigate([
              '/login'
            ]);

            return throwError(
              () => error
            );
          }

          if (!isRefreshing) {

            isRefreshing = true;

            refreshTokenSubject.next(
              null
            );

            return authService
              .refreshToken()
              .pipe(

                switchMap(() => {

                  isRefreshing = false;

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
              token => token !== null
            ),

            take(1),

            switchMap(
              newAccessToken => {

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