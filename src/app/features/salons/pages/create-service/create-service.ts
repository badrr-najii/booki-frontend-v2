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
  Router,
  RouterLink
} from '@angular/router';

import {
  CreateServiceRequest,
  ServiceService
} from '../../../../core/services/service.service';

@Component({
  selector: 'app-create-service',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-service.html',
  styleUrl: './create-service.css',
})
export class CreateService {

  salonId = '';

  isSubmitting = false;
  errorMessage = '';

  form;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) {

    this.salonId =
      this.route.snapshot.paramMap.get('id') ?? '';

    this.form = this.fb.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      price: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      durationMinutes: [
        30,
        [
          Validators.required,
          Validators.min(5),
          Validators.max(480)
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(500)
        ]
      ],

      isActive: [true]
    });
  }

  submit(): void {

    if (this.form.invalid || !this.salonId) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const value = this.form.getRawValue();

    const request: CreateServiceRequest = {
      salonId: this.salonId,
      name: value.name.trim(),
      price: value.price,
      durationMinutes: value.durationMinutes,
      description:
        value.description.trim() || null,
      isActive: value.isActive
    };

    this.serviceService
      .create(request)
      .subscribe({

        next: () => {
          this.router.navigate([
            '/dashboard/salons',
            this.salonId,
            'services'
          ]);
        },

        error: error => {
          this.isSubmitting = false;

          this.errorMessage =
            error?.error?.error ??
            error?.error?.title ??
            'Impossible de créer le service.';

          this.cdr.detectChanges();
        }

      });
  }
}