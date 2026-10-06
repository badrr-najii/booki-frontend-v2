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
  forkJoin
} from 'rxjs';

import {
  BookingItem,
  BookingService,
  BookingStatus
} from '../../../../core/services/booking.service';

import {
  PaymentResponse,
  PaymentService,
  PaymentStatus
} from '../../../../core/services/payment.service';

import {
  SalonResponse,
  SalonService
} from '../../../../core/services/salon.service';

@Component({
  selector: 'app-owner-payments',
  imports: [
    RouterLink
  ],
  templateUrl: './owner-payments.html',
  styleUrl: './owner-payments.css'
})
export class OwnerPayments implements OnInit {
  salon: SalonResponse | null = null;
  bookings: BookingItem[] = [];
  payments: PaymentResponse[] = [];

  isLoading = true;
  creatingBookingId: string | null = null;
  refundingPaymentId: string | null = null;

  errorMessage = '';
  successMessage = '';

  readonly BookingStatus = BookingStatus;
  readonly PaymentStatus = PaymentStatus;

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const salonId =
      this.route.snapshot.paramMap.get('id');

    if (!salonId) {
      this.errorMessage =
        'Identifiant du salon invalide.';
      this.isLoading = false;
      return;
    }

    this.load(salonId);
  }

  get confirmedBookings(): BookingItem[] {
    return this.bookings.filter(
      booking =>
        booking.status === BookingStatus.Confirmed
    );
  }

  canCreateCheckout(
    booking: BookingItem
  ): boolean {
    if (
      booking.status !== BookingStatus.Confirmed
    ) {
      return false;
    }

    return !this.payments.some(
      payment =>
        payment.bookingId === booking.id &&
        (
          payment.status === PaymentStatus.Pending ||
          payment.status === PaymentStatus.Paid
        )
    );
  }

  createCheckout(
    booking: BookingItem
  ): void {
    if (
      !this.canCreateCheckout(booking) ||
      this.creatingBookingId
    ) {
      return;
    }

    this.creatingBookingId = booking.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.paymentService
      .createCardCheckout(booking.id)
      .subscribe({
        next: payment => {
          this.creatingBookingId = null;

          if (!payment.redirectUrl) {
            this.errorMessage =
              'Le lien de paiement Stripe est indisponible.';
            this.reloadPayments();
            this.cdr.detectChanges();
            return;
          }

          window.location.assign(
            payment.redirectUrl
          );
        },
        error: () => {
          this.creatingBookingId = null;
          this.errorMessage =
            'Impossible de créer le paiement Stripe.';
          this.reloadPayments();
          this.cdr.detectChanges();
        }
      });
  }

  refund(
    payment: PaymentResponse
  ): void {
    if (
      payment.status !== PaymentStatus.Paid ||
      this.refundingPaymentId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Voulez-vous vraiment rembourser ce paiement ?'
      );

    if (!confirmed) {
      return;
    }

    this.refundingPaymentId =
      payment.paymentId;

    this.errorMessage = '';
    this.successMessage = '';

    this.paymentService
      .refund(payment.paymentId)
      .subscribe({
        next: refundedPayment => {
          this.payments =
            this.payments.map(item =>
              item.paymentId ===
              refundedPayment.paymentId
                ? refundedPayment
                : item
            );

          this.refundingPaymentId = null;
          this.successMessage =
            'Le paiement a été remboursé.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.refundingPaymentId = null;
          this.errorMessage =
            'Impossible de rembourser ce paiement.';
          this.cdr.detectChanges();
        }
      });
  }

  getBooking(
    bookingId: string
  ): BookingItem | undefined {
    return this.bookings.find(
      booking => booking.id === bookingId
    );
  }

  getPaymentStatusLabel(
    status: PaymentStatus
  ): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'En attente';

      case PaymentStatus.Paid:
        return 'Payé';

      case PaymentStatus.Failed:
        return 'Échoué';

      case PaymentStatus.Refunded:
        return 'Remboursé';

      case PaymentStatus.Cancelled:
        return 'Annulé';

      default:
        return 'Inconnu';
    }
  }

  getPaymentStatusClass(
    status: PaymentStatus
  ): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'status-pending';

      case PaymentStatus.Paid:
        return 'status-paid';

      case PaymentStatus.Failed:
        return 'status-failed';

      case PaymentStatus.Refunded:
        return 'status-refunded';

      case PaymentStatus.Cancelled:
        return 'status-cancelled';

      default:
        return '';
    }
  }

  private load(
    salonId: string
  ): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      salon:
        this.salonService.getById(salonId),
      bookings:
        this.bookingService.getBySalon(salonId),
      payments:
        this.paymentService.getBySalon(salonId)
    }).subscribe({
      next: result => {
        this.salon = result.salon;
        this.bookings = result.bookings;
        this.payments = result.payments;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage =
          'Impossible de charger les paiements du salon.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private reloadPayments(): void {
    if (!this.salon) {
      return;
    }

    this.paymentService
      .getBySalon(this.salon.id)
      .subscribe({
        next: payments => {
          this.payments = payments;
          this.cdr.detectChanges();
        }
      });
  }
}
