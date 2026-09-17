import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  SalonServiceItem,
  ServiceService
} from '../../../../core/services/service.service';

import {
  AvailableSlot,
  BookingService
} from '../../../../core/services/booking.service';

import {
  PublicSalonResponse,
  SalonService
} from '../../../../core/services/salon.service';

import {
  resolveApiAssetUrl
} from '../../../../core/config/api.config';

import {
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-public-booking',
  imports: [
    FormsModule
  ],
  templateUrl: './public-booking.html',
  styleUrl: './public-booking.css',
})
export class PublicBooking implements OnInit {

  salonId = '';

  services: SalonServiceItem[] = [];
  slots: AvailableSlot[] = [];

  selectedServiceId = '';
  selectedDate = '';
  selectedSlot?: AvailableSlot;

  isLoadingServices = true;
  isLoadingSlots = false;

  errorMessage = '';

  clientName = '';
  clientPhone = '';
  clientEmail = '';
  notes = '';

  isSubmitting = false;
  bookingCreated = false;
  minDate = '';

  salon?: PublicSalonResponse;
  isLoadingSalon = true;

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private serviceService: ServiceService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.salonId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.salonId) {
      this.errorMessage =
        'Identifiant du salon invalide.';
      this.isLoadingServices = false;
      return;
    }

    const today = new Date();

    this.minDate =
      `${today.getFullYear()}-` +
      `${String(today.getMonth() + 1).padStart(2, '0')}-` +
      `${String(today.getDate()).padStart(2, '0')}`;

    this.loadSalon();
    this.loadServices();
  }

  loadSalon(): void {
    this.salonService.getAllPublic().subscribe({
      next: salons => {
        this.salon = salons.find(
          salon =>
            salon.id.toLowerCase() ===
            this.salonId.toLowerCase()
        );

        this.isLoadingSalon = false;

        if (!this.salon) {
          this.errorMessage =
            'Salon introuvable ou indisponible.';
        }

        this.cdr.detectChanges();
      },

      error: () => {
        this.isLoadingSalon = false;
        this.errorMessage =
          'Impossible de charger les informations du salon.';
        this.cdr.detectChanges();
      }
    });
  }

  getSalonLogoUrl(): string | null {
    return resolveApiAssetUrl(
      this.salon?.logoUrl
    );
  }

  getSelectedService(): SalonServiceItem | undefined {
    return this.services.find(
      service =>
        service.id === this.selectedServiceId
    );
  }

  loadServices(): void {

    this.serviceService
      .getBySalon(this.salonId)
      .subscribe({

        next: services => {

          this.services = services;
          this.isLoadingServices = false;

          this.cdr.detectChanges();
        },

        error: error => {

          this.isLoadingServices = false;

          this.errorMessage =
            'Impossible de charger les services.';

          this.cdr.detectChanges();
        }

      });
  }

  loadSlots(): void {

    this.slots = [];
    this.selectedSlot = undefined;
    this.errorMessage = '';

    if (
      !this.selectedServiceId ||
      !this.selectedDate
    ) {
      return;
    }

    if (this.selectedDate < this.minDate) {
      this.errorMessage =
        'Veuillez sélectionner une date à partir d’aujourd’hui.';
      return;
    }

    this.isLoadingSlots = true;

    this.bookingService
      .getAvailableSlots(
        this.salonId,
        this.selectedDate,
        this.selectedServiceId
      )
      .subscribe({

        next: slots => {

          this.slots = slots;
          this.isLoadingSlots = false;

          this.cdr.detectChanges();
        },

        error: error => {

          this.isLoadingSlots = false;

          this.errorMessage =
            'Impossible de charger les créneaux disponibles.';

          this.cdr.detectChanges();
        }

      });
  }

  selectSlot(slot: AvailableSlot): void {
    this.selectedSlot = slot;
  }

  submitBooking(): void {

    if (!this.selectedServiceId) {
      this.errorMessage =
        'Veuillez sélectionner un service.';
      return;
    }

    if (!this.selectedDate) {
      this.errorMessage =
        'Veuillez sélectionner une date.';
      return;
    }

    if (this.selectedDate < this.minDate) {
      this.errorMessage =
        'Veuillez sélectionner une date à partir d’aujourd’hui.';
      return;
    }

    if (!this.selectedSlot) {
      this.errorMessage =
        'Veuillez sélectionner un créneau.';
      return;
    }

    if (!this.clientName.trim()) {
      this.errorMessage =
        'Votre nom est obligatoire.';
      return;
    }

    if (this.clientName.trim().length > 100) {
      this.errorMessage =
        'Le nom ne peut pas dépasser 100 caractères.';
      return;
    }

    if (!this.clientPhone.trim()) {
      this.errorMessage =
        'Votre téléphone est obligatoire.';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.clientPhone.trim())) {
      this.errorMessage =
        'Le numéro de téléphone doit contenir exactement 10 chiffres.';
      return;
    }

    const email = this.clientEmail.trim();

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      this.errorMessage =
        'Veuillez saisir une adresse email valide.';
      return;
    }

    if (this.notes.trim().length > 500) {
      this.errorMessage =
        'Les notes ne peuvent pas dépasser 500 caractères.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.bookingService
      .create({
        salonId: this.salonId,
        serviceId: this.selectedServiceId,

        employeeId:
          this.selectedSlot.employeeId ?? null,

        bookingDate:
          this.selectedDate,

        startTime:
          this.selectedSlot.startTime,

        clientName:
          this.clientName.trim(),

        clientPhone:
          this.clientPhone.trim(),

        clientEmail:
          this.clientEmail.trim() || null,

        notes:
          this.notes.trim() || null
      })
      .subscribe({

        next: () => {

          this.isSubmitting = false;
          this.bookingCreated = true;

          this.cdr.detectChanges();
        },

        error: error => {

          this.isSubmitting = false;

          this.errorMessage =
            'Impossible de créer la réservation.';

          this.cdr.detectChanges();
        }

      });
  }

  formatTime(value: string): string {
    if (!value) {
      return '';
    }

    return value.substring(0, 5);
  }
}