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
  FormsModule
} from '@angular/forms';

import {
  DayOfWeek,
  WorkingHoursItem,
  WorkingHoursService
} from '../../../../core/services/working-hours.service';

interface WorkingDayForm {
  day: DayOfWeek;
  label: string;
  id?: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  isSaving: boolean;
}

@Component({
  selector: 'app-salon-working-hours',
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './salon-working-hours.html',
  styleUrl: './salon-working-hours.css',
})
export class SalonWorkingHours implements OnInit {

  salonId = '';

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  days: WorkingDayForm[] = [
    {
      day: DayOfWeek.Monday,
      label: 'Lundi',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
      isSaving: false
    },
    {
      day: DayOfWeek.Tuesday,
      label: 'Mardi',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
      isSaving: false
    },
    {
      day: DayOfWeek.Wednesday,
      label: 'Mercredi',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
      isSaving: false
    },
    {
      day: DayOfWeek.Thursday,
      label: 'Jeudi',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
      isSaving: false
    },
    {
      day: DayOfWeek.Friday,
      label: 'Vendredi',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
      isSaving: false
    },
    {
      day: DayOfWeek.Saturday,
      label: 'Samedi',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
      isSaving: false
    },
    {
      day: DayOfWeek.Sunday,
      label: 'Dimanche',
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: true,
      isSaving: false
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private workingHoursService: WorkingHoursService,
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

    this.loadWorkingHours();
  }

  loadWorkingHours(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.workingHoursService
      .getBySalon(this.salonId)
      .subscribe({

        next: hours => {

          for (const item of hours) {
            this.applyExistingHours(item);
          }

          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.error ??
            error?.error?.title ??
            'Impossible de charger les horaires.';

          this.cdr.detectChanges();
        }

      });
  }

  private applyExistingHours(
    item: WorkingHoursItem
  ): void {

    const day =
      this.days.find(x => x.day === item.day);

    if (!day) {
      return;
    }

    day.id = item.id;
    day.openTime =
      this.formatTime(item.openTime);
    day.closeTime =
      this.formatTime(item.closeTime);
    day.isClosed =
      item.isClosed;
  }

  private formatTime(value: string): string {

    if (!value) {
      return '';
    }

    return value.substring(0, 5);
  }

  save(day: WorkingDayForm): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !day.isClosed &&
      (!day.openTime || !day.closeTime)
    ) {
      this.errorMessage =
        `Veuillez renseigner les horaires pour ${day.label}.`;
      return;
    }

    if (
      !day.isClosed &&
      day.openTime >= day.closeTime
    ) {
      this.errorMessage =
        `L'heure d'ouverture doit être avant l'heure de fermeture pour ${day.label}.`;
      return;
    }

    const openTime =
      day.isClosed
        ? '00:00:00'
        : day.openTime;

    const closeTime =
      day.isClosed
        ? '00:00:00'
        : day.closeTime;

    day.isSaving = true;

    if (day.id) {

      this.workingHoursService
        .update(
          day.id,
          {
            openTime,
            closeTime,
            isClosed: day.isClosed
          }
        )
        .subscribe({

          next: result => {

            day.openTime =
              this.formatTime(result.openTime);

            day.closeTime =
              this.formatTime(result.closeTime);

            day.isClosed =
              result.isClosed;

            day.isSaving = false;

            this.successMessage =
              `Horaires de ${day.label} enregistrés.`;

            this.cdr.detectChanges();
          },

          error: error => {
            day.isSaving = false;
            this.handleError(error);
          }

        });

      return;
    }

    this.workingHoursService
      .create({
        salonId: this.salonId,
        day: day.day,
        openTime,
        closeTime,
        isClosed: day.isClosed
      })
      .subscribe({

        next: result => {

          day.id = result.id;

          day.openTime =
            this.formatTime(result.openTime);

          day.closeTime =
            this.formatTime(result.closeTime);

          day.isClosed =
            result.isClosed;

          day.isSaving = false;

          this.successMessage =
            `Horaires de ${day.label} enregistrés.`;

          this.cdr.detectChanges();
        },

        error: error => {
          day.isSaving = false;
          this.handleError(error);
        }

      });
  }

  private handleError(error: any): void {

    this.errorMessage =
      error?.error?.detail ??
      error?.error?.error ??
      error?.error?.title ??
      'Impossible d’enregistrer les horaires.';

    this.cdr.detectChanges();
  }
}