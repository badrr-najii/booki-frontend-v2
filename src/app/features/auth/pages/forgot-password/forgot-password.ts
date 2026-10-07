import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  forgotPasswordForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.forgotPasswordForm =
      this.fb.nonNullable.group({
        email: ['', [
          Validators.required,
          Validators.email
        ]]
      });
  }

  get email() {
    return this.forgotPasswordForm.controls.email;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService
      .forgotPassword(
        this.forgotPasswordForm.getRawValue()
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage =
            'Si un compte correspond à cette adresse, un e-mail de réinitialisation a été envoyé.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Impossible de traiter la demande pour le moment.';
          this.cdr.detectChanges();
        }
      });
  }
}
