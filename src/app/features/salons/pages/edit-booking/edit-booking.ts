import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import {
  AvailableSlot,
  BookingItem,
  BookingService,
  BookingStatus
} from '../../../../core/services/booking.service';

import {
  EmployeeItem,
  EmployeeService
} from '../../../../core/services/employee.service';

@Component({
  selector: 'app-edit-booking',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './edit-booking.html',
  styleUrl: './edit-booking.css',
})
export class EditBooking implements OnInit {

  salonId = '';
  bookingId = '';

  booking?: BookingItem;

  employees: EmployeeItem[] = [];
  availableSlots: AvailableSlot[] = [];

  employeeId = '';
  bookingDate = '';
  startTime = '';

  clientName = '';
  clientPhone = '';
  clientEmail = '';
  notes = '';

  isLoading = true;
  isLoadingSlots = false;
  isSubmitting = false;

  errorMessage = '';
  canEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.salonId =
      this.route.snapshot.paramMap.get('id') ?? '';

    this.bookingId =
      this.route.snapshot.paramMap.get('bookingId') ?? '';

    if (!this.salonId || !this.bookingId) {
      this.errorMessage =
        'Identifiant de réservation invalide.';

      this.isLoading = false;
      return;
    }

    this.loadData();
  }

  loadData(): void {

    this.bookingService
      .getById(this.bookingId)
      .subscribe({

        next: booking => {

          this.booking = booking;

          if (
            booking.status !== BookingStatus.Pending &&
            booking.status !== BookingStatus.Confirmed
          ) {
            this.errorMessage =
              'Cette réservation ne peut plus être modifiée.';

            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          this.canEdit = true;

          this.employeeId =
            booking.employeeId ?? '';

          this.bookingDate =
            booking.bookingDate.substring(0, 10);

          this.startTime =
            booking.startTime.substring(0, 5);

          this.clientName =
            booking.clientName;

          this.clientPhone =
            booking.clientPhone;

          this.clientEmail =
            booking.clientEmail ?? '';

          this.notes =
            booking.notes ?? '';

          this.loadEmployees();
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger la réservation.';

          this.cdr.detectChanges();
        }
      });
  }

  loadEmployees(): void {

    this.employeeService
      .getAllBySalon(this.salonId)
      .subscribe({

        next: employees => {

          this.employees = employees;
          this.isLoading = false;

          this.loadAvailableSlots();

          this.cdr.detectChanges();
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger les employés.';

          this.cdr.detectChanges();
        }
      });
  }

  onDateChange(): void {
    this.startTime = '';
    this.loadAvailableSlots();
  }

  onEmployeeChange(): void {
    this.startTime = '';
    this.loadAvailableSlots();
  }

  loadAvailableSlots(): void {

    if (
      !this.booking ||
      !this.bookingDate
    ) {
      return;
    }

    this.isLoadingSlots = true;

    this.bookingService
      .getAvailableSlotsForEdit(
        this.bookingId,
        this.bookingDate,
        this.employeeId || undefined
      )
      .subscribe({

        next: slots => {

          this.availableSlots = slots;

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

    this.startTime =
      slot.startTime.substring(0, 5);
  }

  isSelectedSlot(slot: AvailableSlot): boolean {

    return (
      slot.startTime.substring(0, 5) ===
      this.startTime
    );
  }

  submit(): void {

    if (!this.clientName.trim()) {
      this.errorMessage =
        'Le nom du client est obligatoire.';
      return;
    }

    if (this.clientName.trim().length > 100) {
      this.errorMessage =
        'Le nom du client ne peut pas dépasser 100 caractères.';
      return;
    }

    if (!this.clientPhone.trim()) {
      this.errorMessage =
        'Le téléphone du client est obligatoire.';
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

    if (
      !this.bookingDate ||
      !this.startTime
    ) {
      this.errorMessage =
        'La date et l’heure sont obligatoires.';
      return;
    }

    if (this.notes.trim().length > 500) {
      this.errorMessage =
        'Les notes ne peuvent pas dépasser 500 caractères.';
      return;
    }

    const today = new Date();
    const minDate =
      `${today.getFullYear()}-` +
      `${String(today.getMonth() + 1).padStart(2, '0')}-` +
      `${String(today.getDate()).padStart(2, '0')}`;

    if (this.bookingDate < minDate) {
      this.errorMessage =
        'La date de réservation ne peut pas être dans le passé.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.bookingService
      .update(
        this.bookingId,
        {
          employeeId:
            this.employeeId || null,

          removeEmployee:
            !this.employeeId,

          bookingDate:
            this.bookingDate,

          startTime:
            this.startTime,

          clientName:
            this.clientName.trim(),

          clientPhone:
            this.clientPhone.trim(),

          clientEmail:
            this.clientEmail.trim() || null,

          notes:
            this.notes.trim() || null
        }
      )
      .subscribe({

        next: () => {

          this.router.navigate([
            '/dashboard/salons',
            this.salonId,
            'bookings'
          ]);
        },

        error: error => {

          this.isSubmitting = false;

          this.errorMessage =
            'Impossible de modifier la réservation.';
          this.cdr.detectChanges();
        }
      });
  }
}