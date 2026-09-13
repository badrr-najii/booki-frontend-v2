import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  DashboardService
} from '../../../../core/services/dashboard.service';

import {
  DashboardSalon,
  DashboardStats
} from '../../../../core/models/dashboard.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  isLoading = true;
  errorMessage = '';

  salons: DashboardSalon[] = [];

  stats: DashboardStats = {
    salons: 0,
    services: 0,
    employees: 0
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService
      .getMySalons()
      .subscribe({
        next: salons => {

          this.salons = salons;

          this.stats = {
            salons: salons.length,

            services: salons.reduce(
              (total, salon) =>
                total + (salon.services?.length ?? 0),
              0
            ),

            employees: salons.reduce(
              (total, salon) =>
                total + (salon.employees?.length ?? 0),
              0
            )
          };

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger le dashboard.';

          this.cdr.detectChanges();
        }
      });
  }
}