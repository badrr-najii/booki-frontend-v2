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
  SalonServiceItem,
  ServiceService
} from '../../../../core/services/service.service';

@Component({
  selector: 'app-salon-services',
  imports: [
    RouterLink
  ],
  templateUrl: './salon-services.html',
  styleUrl: './salon-services.css',
})
export class SalonServices implements OnInit {

  salonId = '';

  isLoading = true;
  errorMessage = '';

  services: SalonServiceItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceService,
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

    this.loadServices();
  }

  loadServices(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.serviceService
      .getAllBySalon(this.salonId)
      .subscribe({

        next: services => {
          this.services = services;
          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: error => {
          this.isLoading = false;

          this.errorMessage =
            error?.error?.error ??
            'Impossible de charger les services.';

          this.cdr.detectChanges();
        }

      });
  }

  deleteService(service: SalonServiceItem): void {

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le service "${service.name}" ?`
    );

    if (!confirmed) {
      return;
    }

    this.serviceService
      .delete(service.id)
      .subscribe({

        next: () => {

          this.services = this.services.filter(
            item => item.id !== service.id
          );

          this.cdr.detectChanges();
        },

        error: error => {

          if (error?.status === 409) {
            this.errorMessage =
              'Impossible de supprimer ce service car il est associé à une ou plusieurs réservations.';
          } else {
            this.errorMessage =
              error?.error?.detail ??
              error?.error?.error ??
              error?.error?.title ??
              'Impossible de supprimer le service.';
          }

          this.cdr.detectChanges();
        }
      });
  }
}
