
import {
  Component,
  Input
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  PublicSalonResponse,
  SalonAudience
} from '../../../../core/services/salon.service';

import {
  resolveApiAssetUrl
} from '../../../../core/config/api.config';

@Component({
  selector: 'app-hero',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {

  @Input() salons: PublicSalonResponse[] = [];
  @Input() isLoading = true;
  @Input() loadFailed = false;

  searchTerm = '';
  selectedAudience: SalonAudience | null = null;

  readonly SalonAudience = SalonAudience;

  get filteredSalons(): PublicSalonResponse[] {
    const term = this.normalize(this.searchTerm);

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

        const matchesName =
          this.normalize(salon.name).includes(term);

        const matchesCity =
          this.normalize(salon.city).includes(term);

        const matchesService =
          salon.services.some(service =>
            service.isActive &&
            this.normalize(service.name).includes(term)
          );

        return matchesName ||
          matchesCity ||
          matchesService;
      })
      .slice(0, 3);
  }

  selectAudience(
    audience: SalonAudience | null
  ): void {
    this.selectedAudience = audience;
  }

  getLogoUrl(
    salon: PublicSalonResponse
  ): string | null {
    return resolveApiAssetUrl(salon.logoUrl);
  }

  private normalize(
    value: string | null | undefined
  ): string {
    return (value ?? '')
      .trim()
      .toLocaleLowerCase();
  }
}
