import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter
} from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AuthService } from '../../../../core/services/auth.service';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let fixture: ComponentFixture<ResetPassword>;
  let component: ResetPassword;

  const authService = {
    resetPassword: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authService
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({
                email: 'owner@test.com',
                token: 'reset-token'
              })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should read the reset link parameters', () => {
    expect(component.hasValidLink).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    component.resetPasswordForm.setValue({
      newPassword: 'NewPassword123!',
      confirmPassword: 'OtherPassword123!'
    });

    component.onSubmit();

    expect(authService.resetPassword)
      .not.toHaveBeenCalled();

    expect(component.errorMessage)
      .toContain('ne correspondent pas');
  });

  it('should reset the password with the link email and token', () => {
    authService.resetPassword.mockReturnValue(
      of({
        success: true,
        message: 'ok'
      })
    );

    component.resetPasswordForm.setValue({
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });

    component.onSubmit();

    expect(authService.resetPassword)
      .toHaveBeenCalledWith({
        email: 'owner@test.com',
        token: 'reset-token',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

    expect(component.isSuccess).toBe(true);
  });

  it('should show an error when reset fails', () => {
    authService.resetPassword.mockReturnValue(
      throwError(() => ({ status: 400 }))
    );

    component.resetPasswordForm.setValue({
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });

    component.onSubmit();

    expect(component.errorMessage)
      .toBeTruthy();

    expect(component.isLoading)
      .toBe(false);
  });
});
