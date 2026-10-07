import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../../core/services/auth.service';
import { Account } from './account';

describe('Account', () => {
  let fixture: ComponentFixture<Account>;
  let component: Account;
  let router: Router;

  const owner = {
    userId: 'owner-id',
    email: 'owner@test.com',
    name: 'Owner',
    role: 'Owner',
    isEmailConfirmed: false
  };

  const authService = {
    getCurrentUser: vi.fn(),
    changePassword: vi.fn(),
    resendConfirmation: vi.fn(),
    clearSession: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    authService.getCurrentUser.mockReturnValue(
      of(owner)
    );

    await TestBed.configureTestingModule({
      imports: [Account],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Account);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should load the current user', () => {
    expect(authService.getCurrentUser)
      .toHaveBeenCalledTimes(1);

    expect(component.user)
      .toEqual(owner);

    expect(component.isLoadingUser)
      .toBe(false);
  });

  it('should use the owner dashboard link for an owner', () => {
    expect(component.dashboardLink)
      .toBe('/dashboard');
  });

  it('should use the admin dashboard link for an admin', () => {
    component.user = {
      ...owner,
      role: 'Admin'
    };

    expect(component.dashboardLink)
      .toBe('/admin');
  });

  it('should resend confirmation for an unconfirmed user', () => {
    authService.resendConfirmation.mockReturnValue(
      of({ message: 'sent' })
    );

    component.resendConfirmation();

    expect(authService.resendConfirmation)
      .toHaveBeenCalledWith({
        email: 'owner@test.com'
      });

    expect(component.resendMessage)
      .toBeTruthy();
  });

  it('should not resend confirmation for a confirmed user', () => {
    component.user = {
      ...owner,
      isEmailConfirmed: true
    };

    component.resendConfirmation();

    expect(authService.resendConfirmation)
      .not.toHaveBeenCalled();
  });

  it('should reject mismatched new passwords', () => {
    component.changePasswordForm.setValue({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'OtherPassword123!'
    });

    component.changePassword();

    expect(authService.changePassword)
      .not.toHaveBeenCalled();

    expect(component.passwordError)
      .toContain('ne correspondent pas');
  });

  it('should clear the session and navigate to login after password change', () => {
    authService.changePassword.mockReturnValue(
      of({
        success: true,
        message: 'changed'
      })
    );

    const navigateSpy =
      vi.spyOn(router, 'navigate')
        .mockResolvedValue(true);

    component.changePasswordForm.setValue({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });

    component.changePassword();

    expect(authService.changePassword)
      .toHaveBeenCalledWith({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

    expect(authService.clearSession)
      .toHaveBeenCalledTimes(1);

    expect(navigateSpy)
      .toHaveBeenCalledWith(
        ['/login'],
        {
          queryParams: {
            passwordChanged: 'true'
          }
        }
      );
  });

  it('should keep the session when password change fails', () => {
    authService.changePassword.mockReturnValue(
      throwError(() => ({ status: 400 }))
    );

    component.changePasswordForm.setValue({
      currentPassword: 'WrongPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });

    component.changePassword();

    expect(authService.clearSession)
      .not.toHaveBeenCalled();

    expect(component.passwordError)
      .toBeTruthy();

    expect(component.isChangingPassword)
      .toBe(false);
  });

  it('should show an error when current user loading fails', () => {
    authService.getCurrentUser.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );

    const failedFixture =
      TestBed.createComponent(Account);

    failedFixture.detectChanges();

    const failedComponent =
      failedFixture.componentInstance;

    expect(failedComponent.user)
      .toBeNull();

    expect(failedComponent.loadError)
      .toBeTruthy();

    expect(failedComponent.isLoadingUser)
      .toBe(false);
  });
});
