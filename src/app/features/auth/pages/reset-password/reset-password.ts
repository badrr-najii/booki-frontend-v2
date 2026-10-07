import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {

  isLoading = false;
  isSuccess = false;
  errorMessage = '';

  readonly email: string;
  readonly token: string;

  resetPasswordForm;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.email =
      this.route.snapshot.queryParamMap.get('email') ?? '';

    this.token =
      this.route.snapshot.queryParamMap.get('token') ?? '';

    this.resetPasswordForm =
      this.fb.nonNullable.group({
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

  get newPassword() {
    return this.resetPasswordForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.resetPasswordForm.controls.confirmPassword;
  }

  get hasValidLink(): boolean {
    return !!this.email && !!this.token;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.hasValidLink) {
      this.errorMessage =
        'Le lien de réinitialisation est invalide.';
      return;
    }

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const form =
      this.resetPasswordForm.getRawValue();

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      this.errorMessage =
        'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;

    this.authService
      .resetPassword({
        email: this.email,
        token: this.token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.isSuccess = true;
          this.resetPasswordForm.disable();
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Le lien est invalide ou expiré, ou le mot de passe ne respecte pas les règles requises.';
          this.cdr.detectChanges();
        }
      });
  }
}
