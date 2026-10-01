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

import {
  forkJoin
} from 'rxjs';

import {
  PublicReview,
  ReviewService,
  SalonRating
} from '../../../../core/services/review.service';

@Component({
  selector: 'app-public-salon-details',
  imports: [RouterLink],
  templateUrl: './public-salon-details.html',
  styleUrl: './public-salon-details.css',
})
export class PublicSalonDetails implements OnInit {

  salon?: PublicSalonResponse;
  reviews: PublicReview[] = [];
  rating?: SalonRating;

  reviewsLoading = false;
  reviewsLoadFailed = false;

  isLoading = true;
  errorMessage = '';

  readonly SalonAudience = SalonAudience;

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) { }

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
          this.loadReviews(salon.id);
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

  getStars(
    value: number
  ): string {
    const rating =
      Math.max(0, Math.min(5, Math.round(value)));

    return '★'.repeat(rating) +
      '☆'.repeat(5 - rating);
  }

  private loadReviews(
    salonId: string
  ): void {
    this.reviewsLoading = true;
    this.reviewsLoadFailed = false;

    forkJoin({
      reviews:
        this.reviewService.getPublicBySalon(salonId),
      rating:
        this.reviewService.getSalonRating(salonId)
    }).subscribe({
      next: result => {
        this.reviews = result.reviews;
        this.rating = result.rating;
        this.reviewsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviewsLoadFailed = true;
        this.reviewsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
