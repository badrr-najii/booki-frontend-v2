import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  EmployeeService
} from '../../../../core/services/employee.service';

@Component({
  selector: 'app-create-employee',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './create-employee.html',
  styleUrl: './create-employee.css',
})
export class CreateEmployee {

  salonId = '';

  fullName = '';
  phoneNumber = '';
  specialty = '';

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {
    this.salonId =
      this.route.snapshot.paramMap.get('id') ?? '';
  }

  submit(): void {

    if (!this.fullName.trim()) {
      this.errorMessage =
        'Le nom de l’employé est obligatoire.';
      return;
    }

    if (!this.salonId) {
      this.errorMessage =
        'Identifiant du salon invalide.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.employeeService
      .create({
        salonId: this.salonId,
        fullName: this.fullName.trim(),
        phoneNumber:
          this.phoneNumber.trim() || null,
        specialty:
          this.specialty.trim() || null
      })
      .subscribe({

        next: () => {
          this.router.navigate([
            '/dashboard/salons',
            this.salonId,
            'employees'
          ]);
        },

        error: error => {
          this.isSubmitting = false;

          this.errorMessage =
            error?.error?.error ??
            error?.error?.title ??
            'Impossible de créer l’employé.';

          this.cdr.detectChanges();
        }

      });
  }
}