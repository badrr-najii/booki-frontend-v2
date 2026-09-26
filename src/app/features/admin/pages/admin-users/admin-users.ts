import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminService,
  AdminUser
} from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  imports: [
    DatePipe,
    FormsModule
  ],
  templateUrl: './admin-users.html',
})
export class AdminUsers implements OnInit {

  users: AdminUser[] = [];

  page = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  search = '';
  selectedRole = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = this.page): void {

    if (page < 1) {
      return;
    }

    if (
      this.totalPages > 0 &&
      page > this.totalPages
    ) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.adminService
      .getUsers(
        page,
        this.pageSize,
        this.search,
        this.selectedRole
      )
      .subscribe({
        next: response => {
          this.users = response.items;
          this.page = response.page;
          this.pageSize = response.pageSize;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;

          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Impossible de charger les utilisateurs.';
          this.cdr.detectChanges();
        }
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadUsers(1);
  }

  clearFilters(): void {
    this.search = '';
    this.selectedRole = '';
    this.page = 1;
    this.loadUsers(1);
  }

  previousPage(): void {
    this.loadUsers(this.page - 1);
  }

  nextPage(): void {
    this.loadUsers(this.page + 1);
  }
}