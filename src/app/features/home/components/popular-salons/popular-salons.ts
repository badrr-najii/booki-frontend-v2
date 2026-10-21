
import {
  Component,
  Input
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  PublicSalonResponse,
  SalonAudience
} from '../../../../core/services/salon.service';

import {
  resolveApiAssetUrl
} from '../../../../core/config/api.config';

@Component({
  selector: 'app-popular-salons',
  imports: [RouterLink, FormsModule],
  templateUrl: './popular-salons.html',
  styleUrl: './popular-salons.css',
})
export class PopularSalons {

  @Input() salons: PublicSalonResponse[] = [];
  @Input() isLoading = true;
  @Input() loadFailed = false;

  readonly SalonAudience = SalonAudience;

  selectedAudience: SalonAudience | null = null;
  searchTerm = '';

  get errorMessage(): string {
    return this.loadFailed
      ? 'Impossible de charger les salons pour le moment.'
      : '';
  }
get filteredSalons(): PublicSalonResponse[] {
  const term = this.searchTerm.trim().toLocaleLowerCase();

  return this.salons
    .filter(salon => {
      const matchesAudience =
        this.selectedAudience === null ||
        salon.audience === this.selectedAudience;

      if (!matchesAudience) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        salon.name.toLocaleLowerCase().includes(term) ||
        (salon.city ?? '').toLocaleLowerCase().includes(term) ||
        salon.services.some(service =>
          service.isActive &&
          service.name.toLocaleLowerCase().includes(term)
        )
      );
    })
    .slice(0, 6);
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
