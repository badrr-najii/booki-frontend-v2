import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import {
  EmployeeService
} from '../../../../core/services/employee.service';

@Component({
  selector: 'app-edit-employee',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './edit-employee.html',
  styleUrl: './edit-employee.css',
})
export class EditEmployee implements OnInit {

  salonId = '';
  employeeId = '';

  fullName = '';
  phoneNumber = '';
  specialty = '';
  isActive = true;

  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.salonId =
      this.route.snapshot.paramMap.get('id') ?? '';

    this.employeeId =
      this.route.snapshot.paramMap.get('employeeId') ?? '';

    if (!this.salonId || !this.employeeId) {
      this.errorMessage =
        'Identifiant invalide.';
      this.isLoading = false;
      return;
    }

    this.loadEmployee();
  }

  loadEmployee(): void {

    this.employeeService
      .getById(this.employeeId)
      .subscribe({

        next: employee => {

          if (employee.salonId !== this.salonId) {
            this.errorMessage =
              'Cet employé ne correspond pas à ce salon.';

            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          this.fullName = employee.fullName;
          this.phoneNumber =
            employee.phoneNumber ?? '';
          this.specialty =
            employee.specialty ?? '';
          this.isActive =
            employee.isActive;

          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            'Impossible de charger l’employé.';

          this.cdr.detectChanges();
        }

      });
  }

  submit(): void {

    if (!this.fullName.trim()) {
      this.errorMessage =
        'Le nom de l’employé est obligatoire.';
      return;
    }

    if (this.fullName.trim().length > 100) {
      this.errorMessage =
        'Le nom ne doit pas dépasser 100 caractères.';
      return;
    }

    if (
      this.phoneNumber.trim() &&
      !/^[0-9]{10}$/.test(this.phoneNumber.trim())
    ) {
      this.errorMessage =
        'Le numéro de téléphone doit contenir exactement 10 chiffres.';
      return;
    }

    if (this.specialty.trim().length > 50) {
      this.errorMessage =
        'La spécialité ne doit pas dépasser 50 caractères.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.employeeService
      .update(
        this.employeeId,
        {
          fullName: this.fullName.trim(),
          phoneNumber:
            this.phoneNumber.trim() || null,
          specialty:
            this.specialty.trim() || null,
          isActive: this.isActive
        }
      )
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
            'Impossible de modifier l’employé.';

          this.cdr.detectChanges();
        }

      });
  }
}