import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  BookingItem,
  BookingService,
  BookingStatus
} from '../../../../core/services/booking.service';

@Component({
  selector: 'app-salon-bookings',
  imports: [
    RouterLink
  ],
  templateUrl: './salon-bookings.html',
  styleUrl: './salon-bookings.css',
})
export class SalonBookings implements OnInit {

  salonId = '';
  isLoading = true;
  errorMessage = '';

  bookings: BookingItem[] = [];

  readonly BookingStatus = BookingStatus;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    const salonId =
      this.route.snapshot.paramMap.get('id');

    if (!salonId) {
      this.errorMessage =
        'Identifiant du salon invalide.';
      this.isLoading = false;
      return;
    }

    this.salonId = salonId;

    this.loadBookings();
  }

  loadBookings(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService
      .getBySalon(this.salonId)
      .subscribe({

        next: bookings => {
          this.bookings = bookings;
          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: error => {
          this.isLoading = false;

          this.errorMessage =
  'Impossible de charger les réservations.';

          this.cdr.detectChanges();
        }

      });
  }

  getStatusLabel(status: BookingStatus): string {

    switch (status) {

      case BookingStatus.Pending:
        return 'En attente';

      case BookingStatus.Confirmed:
        return 'Confirmée';

      case BookingStatus.Completed:
        return 'Terminée';

      case BookingStatus.Cancelled:
        return 'Annulée';

      case BookingStatus.NoShow:
        return 'Absent';

      default:
        return 'Inconnu';
    }
  }

  confirmBooking(booking: BookingItem): void {

    this.errorMessage = '';

    this.bookingService
      .confirm(booking.id)
      .subscribe({

        next: () => {
          this.loadBookings();
        },

        error: error => {
          this.handleActionError(
            error,
            'Impossible de confirmer la réservation.'
          );
        }

      });
  }

  cancelBooking(booking: BookingItem): void {

    const confirmed = window.confirm(
      `Voulez-vous vraiment annuler la réservation de "${booking.clientName}" ?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';

    this.bookingService
      .cancel(booking.id)
      .subscribe({

        next: () => {
          this.loadBookings();
        },

        error: error => {
          this.handleActionError(
            error,
            'Impossible d’annuler la réservation.'
          );
        }

      });
  }

  deleteBooking(booking: BookingItem): void {

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer définitivement la réservation de "${booking.clientName}" ?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';

    this.bookingService
      .delete(booking.id)
      .subscribe({

        next: () => {
          this.loadBookings();
        },

        error: error => {
          this.handleActionError(
            error,
            'Impossible de supprimer la réservation.'
          );
        }

      });
  }

  completeBooking(booking: BookingItem): void {

    this.errorMessage = '';

    this.bookingService
      .complete(booking.id)
      .subscribe({

        next: () => {
          this.loadBookings();
        },

        error: error => {
          this.handleActionError(
            error,
            'Impossible de terminer la réservation.'
          );
        }

      });
  }
  markAsNoShow(
    booking: BookingItem
  ): void {

    this.errorMessage = '';

    this.bookingService
      .noShow(booking.id)
      .subscribe({

        next: () => {
          this.loadBookings();
        },

        error: error => {
          this.handleActionError(
            error,
            'Impossible de marquer la réservation comme absente.'
          );
        }

      });
  }
  private handleActionError(
    error: any,
    fallback: string
  ): void {

    this.errorMessage = fallback;

    this.cdr.detectChanges();
  }

  formatDate(value: string): string {

    if (!value) {
      return '';
    }

    const date = new Date(value);

    return date.toLocaleDateString('fr-FR');
  }

  formatTime(value: string): string {

    if (!value) {
      return '';
    }

    return value.substring(0, 5);
  }

}