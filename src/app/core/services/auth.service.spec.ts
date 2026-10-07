import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  TestBed
} from '@angular/core/testing';

import {
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import {
  API_BASE_URL
} from '../config/api.config';

import {
  AuthService
} from './auth.service';

describe('AuthService auth UX', () => {

  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should request a password reset email', () => {
    service
      .forgotPassword({
        email: 'owner@test.com'
      })
      .subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/auth/forgot-password`
    );

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      email: 'owner@test.com'
    });

    req.flush({
      message: 'Password reset email sent'
    });
  });

  it('should reset the password', () => {
    const body = {
      email: 'owner@test.com',
      token: 'reset-token',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    };

    service
      .resetPassword(body)
      .subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/auth/reset-password`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush({
      success: true,
      message: 'Password reset successfully'
    });
  });

  it('should change the authenticated user password', () => {
    const body = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    };

    service
      .changePassword(body)
      .subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/auth/change-password`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush({
      success: true,
      message: 'Password changed successfully'
    });
  });

  it('should confirm the email address', () => {
    const body = {
      email: 'owner@test.com',
      token: 'confirmation-token'
    };

    service
      .confirmEmail(body)
      .subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/auth/confirm-email`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush({
      message: 'Email confirmed successfully'
    });
  });

  it('should resend the confirmation email', () => {
    service
      .resendConfirmation({
        email: 'owner@test.com'
      })
      .subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/auth/resend-confirmation`
    );

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      email: 'owner@test.com'
    });

    req.flush({
      message: 'Confirmation email resent'
    });
  });

  it('should load the current authenticated user', () => {
    service
      .getCurrentUser()
      .subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/auth/me`
    );

    expect(req.request.method).toBe('GET');

    req.flush({
      userId: 'user-id',
      email: 'owner@test.com',
      name: 'Owner',
      role: 'Owner',
      isEmailConfirmed: true
    });
  });
});
