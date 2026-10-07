import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AuthService } from '../../../../core/services/auth.service';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let fixture: ComponentFixture<ForgotPassword>;
  let component: ForgotPassword;

  const authService = {
    forgotPassword: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not submit an invalid email', () => {
    component.forgotPasswordForm.setValue({
      email: 'invalid-email'
    });

    component.onSubmit();

    expect(authService.forgotPassword)
      .not.toHaveBeenCalled();
  });

  it('should submit the email and show a generic success message', () => {
    authService.forgotPassword.mockReturnValue(
      of({ message: 'ok' })
    );

    component.forgotPasswordForm.setValue({
      email: 'owner@test.com'
    });

    component.onSubmit();

    expect(authService.forgotPassword)
      .toHaveBeenCalledWith({
        email: 'owner@test.com'
      });

    expect(component.successMessage)
      .toContain('Si un compte correspond');
  });

  it('should show an error when the request fails', () => {
    authService.forgotPassword.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );

    component.forgotPasswordForm.setValue({
      email: 'owner@test.com'
    });

    component.onSubmit();

    expect(component.errorMessage)
      .toBeTruthy();

    expect(component.isLoading)
      .toBe(false);
  });
});
