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
  PublicSalonResponse,
  SalonAudience,
  SalonService
} from '../../../../core/services/salon.service';

import {
  resolveApiAssetUrl
} from '../../../../core/config/api.config';

@Component({
  selector: 'app-public-salon-details',
  imports: [RouterLink],
  templateUrl: './public-salon-details.html',
  styleUrl: './public-salon-details.css',
})
export class PublicSalonDetails implements OnInit {

  salon?: PublicSalonResponse;

  isLoading = true;
  errorMessage = '';

  readonly SalonAudience = SalonAudience;

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const slug =
      this.route.snapshot.paramMap.get('slug')?.trim() ?? '';

    if (!slug) {
      this.errorMessage = 'Salon introuvable.';
      this.isLoading = false;
      return;
    }

    this.salonService
      .getPublicBySlug(slug)
      .subscribe({
        next: salon => {
          this.salon = salon;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage =
            'Impossible de charger ce salon pour le moment.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getLogoUrl(): string | null {
    return resolveApiAssetUrl(this.salon?.logoUrl);
  }

  getAudienceLabel(): string {
    switch (this.salon?.audience) {
      case SalonAudience.Women:
        return 'Femmes';

      case SalonAudience.Men:
        return 'Hommes';

      case SalonAudience.Mixed:
        return 'Mixte';

      default:
        return '';
    }
  }
}
