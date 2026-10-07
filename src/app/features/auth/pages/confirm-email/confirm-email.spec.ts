import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter
} from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmEmail } from './confirm-email';

describe('ConfirmEmail', () => {
  let fixture: ComponentFixture<ConfirmEmail>;
  let component: ConfirmEmail;

  const authService = {
    confirmEmail: vi.fn(),
    resendConfirmation: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    authService.confirmEmail.mockReturnValue(
      of({ message: 'confirmed' })
    );

    await TestBed.configureTestingModule({
      imports: [ConfirmEmail],
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
                token: 'confirmation-token'
              })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmEmail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should confirm the email from the link parameters', () => {
    expect(authService.confirmEmail)
      .toHaveBeenCalledWith({
        email: 'owner@test.com',
        token: 'confirmation-token'
      });

    expect(component.isConfirmed).toBe(true);
  });

  it('should resend confirmation with a generic success message', () => {
    component.isConfirmed = false;

    authService.resendConfirmation.mockReturnValue(
      of({ message: 'sent' })
    );

    component.resendForm.setValue({
      email: 'owner@test.com'
    });

    component.resend();

    expect(authService.resendConfirmation)
      .toHaveBeenCalledWith({
        email: 'owner@test.com'
      });

    expect(component.resendMessage)
      .toContain('Si le compte nécessite');
  });

  it('should show an error when resend fails', () => {
    component.isConfirmed = false;

    authService.resendConfirmation.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );

    component.resendForm.setValue({
      email: 'owner@test.com'
    });

    component.resend();

    expect(component.errorMessage)
      .toBeTruthy();

    expect(component.isLoading)
      .toBe(false);
  });
});
