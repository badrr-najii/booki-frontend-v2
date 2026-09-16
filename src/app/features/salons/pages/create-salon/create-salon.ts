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

import {
  SalonService
} from '../../../../core/services/salon.service';

@Component({
  selector: 'app-create-salon',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-salon.html',
  styleUrl: './create-salon.css',
})
export class CreateSalon {

  isLoading = false;
  errorMessage = '';
  selectedLogo: File | null = null;
  logoPreviewUrl: string | null = null;

  salonForm;

  constructor(
    private fb: FormBuilder,
    private salonService: SalonService,
    private router: Router
  ) {

    this.salonForm =
      this.fb.nonNullable.group({

        name: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]],

        slug: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[a-z0-9-]+$/)
        ]],

        description: [''],

        address: ['', [
          Validators.maxLength(200)
        ]],

        city: ['', [
          Validators.required,
          Validators.maxLength(50)
        ]],

        phoneNumber: ['', [
          Validators.pattern(/^[0-9]{10}$/)
        ]],

        email: ['', [
          Validators.email
        ]]
      });
  }

  onNameChange(): void {

    const name =
      this.salonForm.controls.name.value;

    const slug = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    this.salonForm.controls.slug
      .setValue(slug);
  }

  onLogoSelected(event: Event): void {
    this.errorMessage = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage =
        'Format non supporté. Utilisez JPG, PNG, GIF ou WEBP.';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage =
        'La photo ne doit pas dépasser 5 MB.';
      input.value = '';
      return;
    }

    this.selectedLogo = file;

    if (this.logoPreviewUrl) {
      URL.revokeObjectURL(this.logoPreviewUrl);
    }

    this.logoPreviewUrl =
      URL.createObjectURL(file);
  }

  onSubmit(): void {

    this.errorMessage = '';

    if (this.salonForm.invalid) {
      this.salonForm.markAllAsTouched();
      return;
    }

    if (
      !this.salonForm.controls.name.value.trim() ||
      !this.salonForm.controls.city.value.trim()
    ) {
      this.errorMessage =
        'Le nom et la ville sont obligatoires.';
      return;
    }

    this.isLoading = true;

    const form =
      this.salonForm.getRawValue();

    const request = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description:
        form.description.trim() || null,
      address:
        form.address.trim() || null,
      city:
        form.city.trim(),
      phoneNumber:
        form.phoneNumber.trim() || null,
      email:
        form.email.trim() || null,
      logoUrl: null,
      latitude: null,
      longitude: null
    };

    const createRequest = this.selectedLogo
      ? this.salonService.createWithImage(
        request,
        this.selectedLogo
      )
      : this.salonService.create(request);

    createRequest.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([
          '/dashboard'
        ]);
      },

      error: () => {
        this.isLoading = false;
        this.errorMessage =
          'Impossible de créer le salon.';
      }
    });
  }
}