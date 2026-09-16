import {
  Component,
  OnInit
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  PublicSalonResponse,
  SalonService
} from '../../../../core/services/salon.service';

@Component({
  selector: 'app-popular-salons',
  imports: [RouterLink],
  templateUrl: './popular-salons.html',
  styleUrl: './popular-salons.css',
})
export class PopularSalons implements OnInit {

  salons: PublicSalonResponse[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private salonService: SalonService
  ) {}

  ngOnInit(): void {
    this.salonService
      .getAllPublic()
      .subscribe({
        next: salons => {
          this.salons = salons.slice(0, 6);
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage =
            'Impossible de charger les salons pour le moment.';
          this.isLoading = false;
        }
      });
  }

  getStartingPrice(
    salon: PublicSalonResponse
  ): number | null {

    const prices = salon.services
      .filter(service => service.isActive)
      .map(service => service.price);

    return prices.length > 0
      ? Math.min(...prices)
      : null;
  }
}