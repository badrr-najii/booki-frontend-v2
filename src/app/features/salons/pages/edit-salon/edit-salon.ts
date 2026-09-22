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
  SalonAudience,
  SalonResponse,
  SalonService,
  UpdateSalonRequest
} from '../../../../core/services/salon.service';

@Component({
  selector: 'app-edit-salon',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './edit-salon.html',
  styleUrl: './edit-salon.css',
})
export class EditSalon implements OnInit {

  readonly SalonAudience = SalonAudience;

  salonId = '';
  salon: SalonResponse | null = null;

  isLoading = true;
  isSaving = false;
  errorMessage = '';

  salonForm;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private salonService: SalonService,
    private cdr: ChangeDetectorRef
  ) {
    this.salonForm = this.fb.nonNullable.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      description: [''],
      address: ['', [
        Validators.maxLength(200)
      ]],
      city: ['', [
        Validators.maxLength(50)
      ]],
      phoneNumber: ['', [
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      email: ['', [
        Validators.email
      ]],

      audience: [SalonAudience.Mixed, [
        Validators.required
      ]],

      isActive: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Identifiant du salon invalide.';
      this.isLoading = false;
      return;
    }

    this.salonId = id;
    this.loadSalon();
  }

  private loadSalon(): void {
    this.salonService.getById(this.salonId).subscribe({
      next: salon => {
        this.salon = salon;

        this.salonForm.patchValue({
          name: salon.name,
          description: salon.description ?? '',
          address: salon.address ?? '',
          city: salon.city ?? '',
          phoneNumber: salon.phoneNumber ?? '',
          email: salon.email ?? '',
          audience: salon.audience,
          isActive: salon.isActive
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: () => {
        this.isLoading = false;
        this.errorMessage =
          'Impossible de charger le salon.';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.salon || this.salonForm.invalid) {
      this.salonForm.markAllAsTouched();
      return;
    }

    const form = this.salonForm.getRawValue();

    if (!form.name.trim()) {
      this.errorMessage =
        'Le nom du salon est obligatoire.';
      return;
    }

    this.isSaving = true;

    const request: UpdateSalonRequest = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null,
      email: form.email.trim() || null,

      // Preserve fields that are not edited by this form.
      logoUrl: this.salon.logoUrl ?? null,
      audience: form.audience,
      latitude: this.salon.latitude ?? null,
      longitude: this.salon.longitude ?? null,

      isActive: form.isActive
    };

    this.salonService
      .update(this.salonId, request)
      .subscribe({
        next: () => {
          this.isSaving = false;

          this.router.navigate([
            '/dashboard/salons',
            this.salonId
          ]);
        },

        error: () => {
          this.isSaving = false;
          this.errorMessage =
            'Impossible de modifier le salon.';
          this.cdr.detectChanges();
        }
      });
  }
}