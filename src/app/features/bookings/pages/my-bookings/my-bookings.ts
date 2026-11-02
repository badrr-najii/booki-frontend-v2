
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  BookingItem,
  BookingService,
  BookingStatus
} from '../../../../core/services/booking.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);

  bookings: BookingItem[] = [];
  isLoading = true;
  errorMessage = '';

  cancellingBookingId: string | null = null;
  cancelErrorMessage = '';

  canCancel(status: BookingStatus): boolean {
    return status === BookingStatus.Pending ||
      status === BookingStatus.Confirmed;
  }

  cancelBooking(booking: BookingItem): void {
    if (this.cancellingBookingId) return;
    if (!this.canCancel(booking.status)) return;

    const confirmed = window.confirm(
      'Voulez-vous vraiment annuler cette réservation ?'
    );

    if (!confirmed) return;

    this.cancellingBookingId = booking.id;
    this.cancelErrorMessage = '';

    this.bookingService.cancelMyBooking(booking.id).subscribe({
      next: () => {
        this.cancellingBookingId = null;
        this.loadBookings();
        this.cdr.markForCheck();
      },
      error: () => {
        this.cancellingBookingId = null;
        this.cancelErrorMessage =
          "Impossible d'annuler cette réservation.";
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getMyBookings().subscribe({
      next: bookings => {
        this.bookings = bookings;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos réservations.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  statusLabel(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.Pending: return 'En attente';
      case BookingStatus.Confirmed: return 'Confirmée';
      case BookingStatus.Completed: return 'Terminée';
      case BookingStatus.Cancelled: return 'Annulée';
      case BookingStatus.NoShow: return 'Absent';
      default: return 'Inconnu';
    }
  }

  statusClass(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.Confirmed:
        return 'bg-emerald-50 text-emerald-700';
      case BookingStatus.Completed:
        return 'bg-blue-50 text-blue-700';
      case BookingStatus.Cancelled:
      case BookingStatus.NoShow:
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  }
}
