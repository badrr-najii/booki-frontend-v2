import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AdminService,
  AdminStats
} from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    RouterLink
  ],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {

  stats: AdminStats | null = null;

  isLoading = false;
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.adminService
      .getStats()
      .subscribe({
        next: stats => {
          this.stats = stats;
          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Impossible de charger les statistiques.';
          this.cdr.detectChanges();
        }
      });
  }
}