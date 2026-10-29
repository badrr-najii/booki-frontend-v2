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

import { API_BASE_URL } from '../config/api.config';

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

    const apiBaseUrl = new URL(
      API_BASE_URL,
      window.location.origin
    );

    const requestUrl = new URL(
      req.url,
      window.location.origin
    );

    const isApiRequest =
      requestUrl.origin === apiBaseUrl.origin &&
      (
        requestUrl.pathname === apiBaseUrl.pathname ||
        requestUrl.pathname.startsWith(
          `${apiBaseUrl.pathname.replace(/\/$/, '')}/`
        )
      );

    if (!isApiRequest) {
      return next(req);
    }

    const publicAuthPaths = new Set([
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/confirm-email',
      '/auth/resend-confirmation'
    ]);

    const apiPath = apiBaseUrl.pathname.replace(/\/$/, '');

    const relativeApiPath =
      requestUrl.pathname.slice(apiPath.length);

    const isPublicAuthEndpoint =
      publicAuthPaths.has(relativeApiPath);

    if (isPublicAuthEndpoint) {
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

            return authService.refreshToken().pipe(
              catchError(refreshError => {
                isRefreshing = false;
                refreshFailed = true;

                refreshTokenSubject.next(null);

                authService.clearSession();
                router.navigate(['/login']);

                return throwError(() => refreshError);
              }),

              switchMap(() => {
                isRefreshing = false;
                refreshFailed = false;

                const newAccessToken = authService.getAccessToken();

                if (!newAccessToken) {
                  refreshFailed = true;
                  refreshTokenSubject.next(null);

                  authService.clearSession();
                  router.navigate(['/login']);

                  return throwError(() => error);
                }

                refreshTokenSubject.next(newAccessToken);

                const retryRequest = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newAccessToken}`
                  }
                });

                return next(retryRequest);
              })
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