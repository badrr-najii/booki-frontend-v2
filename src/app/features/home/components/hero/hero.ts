import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

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
  selector: 'app-hero',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit {

  salons: PublicSalonResponse[] = [];

  searchTerm = '';
  selectedAudience: SalonAudience | null = null;

  isLoading = true;
  loadFailed = false;

  readonly SalonAudience = SalonAudience;

  constructor(
    private salonService: SalonService,
    private cdr: ChangeDetectorRef
  ) {}

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
          this.loadFailed = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

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