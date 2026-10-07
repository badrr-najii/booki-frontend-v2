import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';

import {
  CurrentUser
} from '../../../../core/models/auth.models';

import {
  AuthService
} from '../../../../core/services/auth.service';

@Component({
  selector: 'app-account',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {

  user: CurrentUser | null = null;

  isLoadingUser = true;
  isChangingPassword = false;
  isResendingConfirmation = false;

  loadError = '';
  passwordError = '';
  resendMessage = '';
  resendError = '';

  changePasswordForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.changePasswordForm =
      this.fb.nonNullable.group({
        currentPassword: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72)
        ]],
        newPassword: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72)
        ]],
        confirmPassword: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72)
        ]]
      });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  get currentPassword() {
    return this.changePasswordForm.controls.currentPassword;
  }

  get newPassword() {
    return this.changePasswordForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.changePasswordForm.controls.confirmPassword;
  }

  get dashboardLink(): string {
    return this.user?.role === 'Admin'
      ? '/admin'
      : '/dashboard';
  }

  changePassword(): void {
    this.passwordError = '';

    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const form =
      this.changePasswordForm.getRawValue();

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      this.passwordError =
        'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isChangingPassword = true;

    this.authService
      .changePassword(form)
      .subscribe({
        next: () => {
          this.isChangingPassword = false;

          // The backend invalidates the current session by
          // incrementing TokenVersion and revoking refresh tokens.
          this.authService.clearSession();

          this.router.navigate(
            ['/login'],
            {
              queryParams: {
                passwordChanged: 'true'
              }
            }
          );
        },
        error: () => {
          this.isChangingPassword = false;
          this.passwordError =
            'Impossible de modifier le mot de passe. Vérifiez votre mot de passe actuel et réessayez.';
          this.cdr.detectChanges();
        }
      });
  }

  resendConfirmation(): void {
    if (
      !this.user?.email ||
      this.user.isEmailConfirmed
    ) {
      return;
    }

    this.resendMessage = '';
    this.resendError = '';
    this.isResendingConfirmation = true;

    this.authService
      .resendConfirmation({
        email: this.user.email
      })
      .subscribe({
        next: () => {
          this.isResendingConfirmation = false;
          this.resendMessage =
            'Un nouvel e-mail de confirmation a été envoyé si nécessaire.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.isResendingConfirmation = false;
          this.resendError =
            'Impossible de renvoyer l’e-mail de confirmation pour le moment.';
          this.cdr.detectChanges();
        }
      });
  }

  private loadCurrentUser(): void {
    this.isLoadingUser = true;
    this.loadError = '';

    this.authService
      .getCurrentUser()
      .subscribe({
        next: user => {
          this.user = user;
          this.isLoadingUser = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingUser = false;
          this.loadError =
            'Impossible de charger les informations du compte.';
          this.cdr.detectChanges();
        }
      });
  }
}
