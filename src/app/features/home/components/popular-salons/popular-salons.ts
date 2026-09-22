import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  PublicSalonResponse,
  SalonAudience,
  SalonService
} from '../../../../core/services/salon.service';

import {
  resolveApiAssetUrl
} from '../../../../core/config/api.config';

@Component({
  selector: 'app-popular-salons',
  imports: [RouterLink],
  templateUrl: './popular-salons.html',
  styleUrl: './popular-salons.css',
})
export class PopularSalons implements OnInit {

  salons: PublicSalonResponse[] = [];

  readonly SalonAudience = SalonAudience;

  selectedAudience: SalonAudience | null = null;

  isLoading = true;
  errorMessage = '';

  constructor(
    private salonService: SalonService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.salonService
      .getAllPublic()
      .subscribe({
        next: salons => {
          this.salons = salons;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage =
            'Impossible de charger les salons pour le moment.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  get filteredSalons(): PublicSalonResponse[] {
    const salons = this.selectedAudience === null
      ? this.salons
      : this.salons.filter(
          salon => salon.audience === this.selectedAudience
        );

    return salons.slice(0, 6);
  }

  selectAudience(
    audience: SalonAudience | null
  ): void {
    this.selectedAudience = audience;
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

  getLogoUrl(
    salon: PublicSalonResponse
  ): string | null {
    return resolveApiAssetUrl(salon.logoUrl);
  }
}