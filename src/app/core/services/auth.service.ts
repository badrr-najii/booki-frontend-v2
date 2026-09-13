import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${API_BASE_URL}/auth`;

  private readonly accessTokenKey =
    'booki_access_token';

  private readonly refreshTokenKey =
    'booki_refresh_token';

  constructor(
    private http: HttpClient
  ) { }

  register(
    request: RegisterRequest
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      request
    );
  }

  login(
    request: LoginRequest
  ): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        request
      )
      .pipe(
        tap(response =>
          this.saveSession(response)
        )
      );
  }

  private saveSession(
    response: AuthResponse
  ): void {

    localStorage.setItem(
      this.accessTokenKey,
      response.accessToken
    );

    localStorage.setItem(
      this.refreshTokenKey,
      response.refreshToken
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(
      this.accessTokenKey
    );
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(
      this.refreshTokenKey
    );
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();

    if (!token) {
      return false;
    }

    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        this.clearSession();
        return false;
      }

      const base64Url = parts[1];
      const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(base64Url.length / 4) * 4, '=');

      const payload = JSON.parse(atob(base64));

      const expirationTime = Number(payload.exp) * 1000;

      if (!Number.isFinite(expirationTime) || Date.now() >= expirationTime) {
        this.clearSession();
        return false;
      }

      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/logout`,
        {}
      )
      .pipe(
        finalize(() => {
          this.clearSession();
        })
      );
  }

  clearSession(): void {

    localStorage.removeItem(
      this.accessTokenKey
    );

    localStorage.removeItem(
      this.refreshTokenKey
    );
  }

  refreshToken(): Observable<AuthResponse> {

    const refreshToken =
      this.getRefreshToken();

    if (!refreshToken) {
      throw new Error(
        'Refresh token not found'
      );
    }

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/refresh-token`,
        {
          refreshToken
        }
      )
      .pipe(
        tap(response =>
          this.saveSession(response)
        )
      );
  }
}