import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  catchError,
  map,
  of
} from 'rxjs';

import {
  AuthService
} from '../services/auth.service';

export const adminGuard: CanActivateFn =
  () => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);

    if (authService.isAdmin()) {
      return true;
    }

    if (authService.isAuthenticated()) {
      return router.createUrlTree(['/']);
    }

    return authService
      .refreshToken()
      .pipe(
        map(() =>
          authService.isAdmin()
            ? true
            : router.createUrlTree(['/'])
        ),

        catchError(() => {
          authService.clearSession();

          return of(
            router.createUrlTree(['/login'])
          );
        })
      );
  };