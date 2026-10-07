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
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css',
})
export class ConfirmEmail implements OnInit {

  isLoading = false;
  isConfirmed = false;
  errorMessage = '';
  resendMessage = '';

  private readonly email: string;
  private readonly token: string;

  resendForm;

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

    this.resendForm =
      this.fb.nonNullable.group({
        email: [this.email, [
          Validators.required,
          Validators.email
        ]]
      });
  }

  ngOnInit(): void {
    if (!this.email || !this.token) {
      this.errorMessage =
        'Le lien de confirmation est invalide.';
      return;
    }

    this.confirmEmail();
  }

  get resendEmail() {
    return this.resendForm.controls.email;
  }

  resend(): void {
    this.resendMessage = '';
    this.errorMessage = '';

    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService
      .resendConfirmation(
        this.resendForm.getRawValue()
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.resendMessage =
            'Si le compte nécessite une confirmation, un nouvel e-mail a été envoyé.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Impossible de renvoyer l’e-mail pour le moment.';
          this.cdr.detectChanges();
        }
      });
  }

  private confirmEmail(): void {
    this.isLoading = true;

    this.authService
      .confirmEmail({
        email: this.email,
        token: this.token
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.isConfirmed = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Le lien de confirmation est invalide ou expiré.';
          this.cdr.detectChanges();
        }
      });
  }
}
