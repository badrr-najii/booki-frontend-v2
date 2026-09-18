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
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  isLoading = false;
  errorMessage = '';

  loginForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72)
      ]],
    });
  }

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  onSubmit(): void {

    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const form = this.loginForm.getRawValue();

    this.authService.login({
      email: form.email,
      password: form.password
    })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.detectChanges();

          this.router.navigate(['/dashboard']);
        },

        error: error => {
          this.isLoading = false;

          this.errorMessage =
            error.status === 400 || error.status === 401
              ? 'Email ou mot de passe incorrect, ou compte non confirmé.'
              : 'Une erreur est survenue lors de la connexion.';

          this.cdr.detectChanges();
        }
      });
  }
}