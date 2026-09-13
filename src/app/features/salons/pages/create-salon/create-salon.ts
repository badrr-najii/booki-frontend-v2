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
          Validators.minLength(2)
        ]],

        slug: ['', [
          Validators.required,
          Validators.minLength(2)
        ]],

        description: [''],
        address: [''],
        city: [''],
        phoneNumber: [''],
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

  onSubmit(): void {

    this.errorMessage = '';

    if (this.salonForm.invalid) {
      this.salonForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const form =
      this.salonForm.getRawValue();

    this.salonService.create({
      name: form.name,
      slug: form.slug,
      description:
        form.description || null,
      address:
        form.address || null,
      city:
        form.city || null,
      phoneNumber:
        form.phoneNumber || null,
      email:
        form.email || null,
      logoUrl: null,
      latitude: null,
      longitude: null
    })
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([
          '/dashboard'
        ]);
      },

      error: error => {

        this.isLoading = false;

        this.errorMessage =
          error?.error?.error ??
          error?.error?.message ??
          'Impossible de créer le salon.';
      }
    });
  }
}