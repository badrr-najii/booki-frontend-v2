import { Component } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  isLoading = false;
  errorMessage = '';

  registerForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.nonNullable.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      phoneNumber: ['', [
        Validators.required
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72)
      ]],

      confirmPassword: ['', [
        Validators.required
      ]]
    });
  }

  get fullName() {
    return this.registerForm.controls.fullName;
  }

  get email() {
    return this.registerForm.controls.email;
  }

  get phoneNumber() {
    return this.registerForm.controls.phoneNumber;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get confirmPassword() {
    return this.registerForm.controls.confirmPassword;
  }

  onSubmit(): void {

    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const form =
      this.registerForm.getRawValue();

    if (
      form.password !==
      form.confirmPassword
    ) {
      this.errorMessage =
        'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      password: form.password,
      role: 0
    })
      .subscribe({
        next: () => {
          this.isLoading = false;

          this.router.navigate(
            ['/login'],
            {
              queryParams: {
                registered: 'true'
              }
            }
          );
        },

        error: error => {
          this.isLoading = false;

          this.errorMessage =
            error?.error?.error ??
            'Une erreur est survenue lors de la création du compte.';
        }
      });
  }
}