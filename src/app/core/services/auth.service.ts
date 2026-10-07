import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

import {
  AuthResponse,
  ChangePasswordRequest,
  ConfirmEmailRequest,
  CurrentUser,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  PasswordActionResponse,
  RegisterRequest,
  ResendConfirmationRequest,
  ResetPasswordRequest
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${API_BASE_URL}/auth`;

  private readonly accessTokenKey =
    'booki_access_token';

  constructor(
    private http: HttpClient
  ) {}

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
        request,
        {
          withCredentials: true
        }
      )
      .pipe(
        tap(response =>
          this.saveSession(response)
        )
      );
  }

  forgotPassword(
    request: ForgotPasswordRequest
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/forgot-password`,
      request
    );
  }

  resetPassword(
    request: ResetPasswordRequest
  ): Observable<PasswordActionResponse> {
    return this.http.post<PasswordActionResponse>(
      `${this.apiUrl}/reset-password`,
      request
    );
  }

  changePassword(
    request: ChangePasswordRequest
  ): Observable<PasswordActionResponse> {
    return this.http.post<PasswordActionResponse>(
      `${this.apiUrl}/change-password`,
      request
    );
  }

  confirmEmail(
    request: ConfirmEmailRequest
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/confirm-email`,
      request
    );
  }

  resendConfirmation(
    request: ResendConfirmationRequest
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/resend-confirmation`,
      request
    );
  }

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(
      `${this.apiUrl}/me`
    );
  }

  private saveSession(
    response: AuthResponse
  ): void {
    localStorage.setItem(
      this.accessTokenKey,
      response.accessToken
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(
      this.accessTokenKey
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
        .padEnd(
          Math.ceil(base64Url.length / 4) * 4,
          '='
        );

      const payload =
        JSON.parse(atob(base64));

      const expirationTime =
        Number(payload.exp) * 1000;

      if (
        !Number.isFinite(expirationTime) ||
        Date.now() >= expirationTime
      ) {
        this.clearSession();
        return false;
      }

      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  getRole(): string | null {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const base64Url = parts[1];
      const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(
          Math.ceil(base64Url.length / 4) * 4,
          '='
        );

      const payload =
        JSON.parse(atob(base64));

      return payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ] ?? payload.role ?? null;
    } catch {
      return null;
    }
  }

  isOwner(): boolean {
    return this.isAuthenticated() &&
      this.getRole() === 'Owner';
  }

  isAdmin(): boolean {
    return this.isAuthenticated() &&
      this.getRole() === 'Admin';
  }

  logout(): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(
        `${this.apiUrl}/logout`,
        {},
        {
          withCredentials: true
        }
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
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/refresh-token`,
        {},
        {
          withCredentials: true
        }
      )
      .pipe(
        tap(response =>
          this.saveSession(response)
        )
      );
  }
}
