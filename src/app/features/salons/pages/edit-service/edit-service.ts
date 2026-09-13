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
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  ServiceService,
  UpdateServiceRequest
} from '../../../../core/services/service.service';

@Component({
  selector: 'app-edit-service',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './edit-service.html',
  styleUrl: './edit-service.css',
})
export class EditService implements OnInit {

  salonId = '';
  serviceId = '';

  isLoading = true;
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

  ngOnInit(): void {

    this.salonId =
      this.route.snapshot.paramMap.get('id') ?? '';

    this.serviceId =
      this.route.snapshot.paramMap.get('serviceId') ?? '';

    if (!this.salonId || !this.serviceId) {
      this.errorMessage =
        'Identifiant du service invalide.';

      this.isLoading = false;
      return;
    }

    this.loadService();
  }

  private loadService(): void {

    this.serviceService
      .getById(this.serviceId)
      .subscribe({

        next: service => {

          if (service.salonId !== this.salonId) {
            this.errorMessage =
              'Ce service ne correspond pas à ce salon.';

            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          this.form.patchValue({
            name: service.name,
            price: service.price,
            durationMinutes:
              service.durationMinutes,
            description:
              service.description ?? '',
            isActive: service.isActive
          });

          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger le service.';

          this.cdr.detectChanges();
        }

      });
  }

  submit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const value =
      this.form.getRawValue();

    const request: UpdateServiceRequest = {
      name: value.name.trim(),
      price: value.price,
      durationMinutes:
        value.durationMinutes,
      description:
        value.description.trim() || null,
      isActive: value.isActive
    };

    this.serviceService
      .update(this.serviceId, request)
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
            'Impossible de modifier le service.';

          this.cdr.detectChanges();
        }

      });
  }
}