import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  AdminService,
  AdminUserDetails
} from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-user-details',
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-user-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminService = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  user: AdminUserDetails | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading = false;
      this.error = 'Utilisateur introuvable.';
      return;
    }

    this.adminService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;

        this.error =
          error.status === 404
            ? 'Utilisateur introuvable.'
            : 'Impossible de charger cet utilisateur.';

        this.cdr.markForCheck();
      }
    });
  }
}