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
  SalonResponse,
  SalonService
} from '../../../../core/services/salon.service';

import {
  SalonDashboardStats,
  RecentBooking,
  TopService,
  TopEmployee,
  BookingChart
} from '../../../../core/models/salon-dashboard.models';

import {
  DashboardService
} from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-salon-details',
  imports: [
    RouterLink
  ],
  templateUrl: './salon-details.html',
  styleUrl: './salon-details.css',
})
export class SalonDetails implements OnInit {

  isLoading = true;
  errorMessage = '';

  salon: SalonResponse | null = null;
  stats: SalonDashboardStats | null = null;

  recentBookings: RecentBooking[] = [];
  topServices: TopService[] = [];
  topEmployees: TopEmployee[] = [];

  statusDistribution: Record<string, number> = {};

  revenueTrend: BookingChart[] = [];
  bookingsByDay: BookingChart[] = [];

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.errorMessage =
        'Identifiant du salon invalide.';

      this.isLoading = false;

      return;
    }

    this.loadSalon(id);
  }

  private loadSalon(
    id: string
  ): void {

    this.salonService
      .getById(id)
      .subscribe({

        next: salon => {

          this.salon = salon;

          this.loadStats(
            salon.id
          );
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger le salon.';

          this.cdr.detectChanges();
        }

      });
  }

  private loadStats(
    salonId: string
  ): void {

    this.dashboardService
      .getSalonStats(salonId)
      .subscribe({

        next: stats => {

          this.stats = stats;

          this.loadRecentBookings(
            salonId
          );
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger les statistiques.';

          this.cdr.detectChanges();
        }

      });
  }

  private loadRecentBookings(
    salonId: string
  ): void {

    this.dashboardService
      .getRecentBookings(
        salonId,
        5
      )
      .subscribe({

        next: bookings => {

          this.recentBookings =
            bookings;

          this.loadTopServices(
            salonId
          );
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger les réservations récentes.';

          this.cdr.detectChanges();
        }

      });
  }

  private loadTopServices(
    salonId: string
  ): void {

    this.dashboardService
      .getTopServices(
        salonId,
        5
      )
      .subscribe({

        next: services => {

          this.topServices =
            services;

          this.loadTopEmployees(
            salonId
          );
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger les services populaires.';

          this.cdr.detectChanges();
        }

      });
  }

  private loadTopEmployees(
    salonId: string
  ): void {

    this.dashboardService
      .getTopEmployees(
        salonId,
        5
      )
      .subscribe({

        next: employees => {

          this.topEmployees =
            employees;

          this.loadStatusDistribution(
            salonId
          );
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger les employés performants.';

          this.cdr.detectChanges();
        }

      });
  }

  private loadStatusDistribution(
    salonId: string
  ): void {

    this.dashboardService
      .getStatusDistribution(
        salonId
      )
      .subscribe({

        next: distribution => {

          this.statusDistribution =
            distribution;

          this.loadRevenueTrend(
            salonId
          );
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger la distribution des statuts.';

          this.cdr.detectChanges();
        }

      });
  }

  private loadRevenueTrend(
    salonId: string
  ): void {

    this.dashboardService
      .getRevenueTrend(
        salonId,
        12
      )
      .subscribe({

        next: data => {

          this.revenueTrend =
            data;

          this.loadBookingsByDay(
            salonId
          );
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger l’évolution du chiffre d’affaires.';

          this.cdr.detectChanges();
        }

      });
  }

  private loadBookingsByDay(
    salonId: string
  ): void {

    this.dashboardService
      .getBookingsByDay(
        salonId,
        30
      )
      .subscribe({

        next: data => {

          this.bookingsByDay =
            data;

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger l’activité des réservations.';

          this.cdr.detectChanges();
        }

      });
  }

  getMaxRevenue(): number {

    if (this.revenueTrend.length === 0) {
      return 0;
    }

    return Math.max(
      ...this.revenueTrend.map(
        item => item.revenue
      )
    );
  }

  getRevenueHeight(
    revenue: number
  ): number {

    const max =
      this.getMaxRevenue();

    if (max <= 0) {
      return 0;
    }

    return Math.max(
      (revenue / max) * 100,
      4
    );
  }

  getMaxBookingCount(): number {

    if (this.bookingsByDay.length === 0) {
      return 0;
    }

    return Math.max(
      ...this.bookingsByDay.map(
        item => item.count
      )
    );
  }

  getBookingBarHeight(
    count: number
  ): number {

    const max =
      this.getMaxBookingCount();

    if (max <= 0) {
      return 0;
    }

    return Math.max(
      (count / max) * 100,
      4
    );
  }

  getStatusLabel(
    status: number
  ): string {

    switch (status) {

      case 0:
        return 'En attente';

      case 1:
        return 'Confirmée';

      case 2:
        return 'Terminée';

      case 3:
        return 'Annulée';

      case 4:
        return 'Absent';

      default:
        return 'Inconnu';
    }
  }

  getStatusClass(
    status: number
  ): string {

    switch (status) {

      case 0:
        return 'status-pending';

      case 1:
        return 'status-confirmed';

      case 2:
        return 'status-completed';

      case 3:
        return 'status-cancelled';

      case 4:
        return 'status-noshow';

      default:
        return '';
    }
  }
}