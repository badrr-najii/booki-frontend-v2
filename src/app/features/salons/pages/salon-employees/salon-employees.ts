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
  EmployeeItem,
  EmployeeService
} from '../../../../core/services/employee.service';

@Component({
  selector: 'app-salon-employees',
  imports: [
    RouterLink
  ],
  templateUrl: './salon-employees.html',
  styleUrl: './salon-employees.css',
})
export class SalonEmployees implements OnInit {

  salonId = '';
  isLoading = true;
  errorMessage = '';
  employees: EmployeeItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
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

    this.loadEmployees();
  }

  loadEmployees(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService
      .getAllBySalon(this.salonId)
      .subscribe({

        next: employees => {
          this.employees = employees;
          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: error => {
          this.isLoading = false;

          this.errorMessage =
            error?.error?.error ??
            error?.error?.title ??
            'Impossible de charger les employés.';

          this.cdr.detectChanges();
        }

      });
  }

  deleteEmployee(employee: EmployeeItem): void {

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'employé "${employee.fullName}" ?`
    );

    if (!confirmed) {
      return;
    }

    this.employeeService
      .delete(employee.id)
      .subscribe({

        next: () => {

          this.employees =
            this.employees.filter(
              item => item.id !== employee.id
            );

          this.cdr.detectChanges();
        },

        error: error => {

          if (error?.status === 409) {
            this.errorMessage =
              'Impossible de supprimer cet employé car il est associé à une ou plusieurs réservations.';
          } else {
            this.errorMessage =
              error?.error?.detail ??
              error?.error?.error ??
              error?.error?.title ??
              'Impossible de supprimer cet employé.';
          }

          this.cdr.detectChanges();
        }

      });
  }
}