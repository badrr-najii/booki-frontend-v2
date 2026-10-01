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
  OwnerReview,
  ReviewService
} from '../../../../core/services/review.service';

@Component({
  selector: 'app-salon-reviews',
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './salon-reviews.html',
  styleUrl: './salon-reviews.css'
})
export class SalonReviews implements OnInit {

  salonId = '';

  reviews: OwnerReview[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  processingReviewId: string | null = null;
  respondingReviewId: string | null = null;

  responseDrafts: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.salonId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.salonId) {
      this.errorMessage = 'Salon invalide.';
      this.isLoading = false;
      return;
    }

    this.loadReviews();
  }

  get pendingReviews(): OwnerReview[] {
    return this.reviews.filter(
      review => !review.isApproved
    );
  }

  get approvedReviews(): OwnerReview[] {
    return this.reviews.filter(
      review => review.isApproved
    );
  }

  getStars(value: number): string {
    const rating =
      Math.max(0, Math.min(5, Math.round(value)));

    return '★'.repeat(rating) +
      '☆'.repeat(5 - rating);
  }

  approve(review: OwnerReview): void {
    if (this.processingReviewId) {
      return;
    }

    this.clearMessages();
    this.processingReviewId = review.id;

    this.reviewService
      .approve(review.id)
      .subscribe({
        next: updated => {
          this.replaceReview(updated);
          this.processingReviewId = null;
          this.successMessage =
            'Avis approuvé avec succès.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.processingReviewId = null;
          this.errorMessage =
            'Impossible d’approuver cet avis.';
          this.cdr.detectChanges();
        }
      });
  }

  reject(review: OwnerReview): void {
    if (this.processingReviewId) {
      return;
    }

    this.clearMessages();
    this.processingReviewId = review.id;

    this.reviewService
      .reject(review.id)
      .subscribe({
        next: updated => {
          this.replaceReview(updated);
          this.processingReviewId = null;
          this.successMessage =
            'Avis retiré de la publication.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.processingReviewId = null;
          this.errorMessage =
            'Impossible de rejeter cet avis.';
          this.cdr.detectChanges();
        }
      });
  }

  saveResponse(review: OwnerReview): void {
    if (this.respondingReviewId) {
      return;
    }

    const response =
      (this.responseDrafts[review.id] ?? '').trim();

    if (!response) {
      this.errorMessage =
        'La réponse ne peut pas être vide.';
      return;
    }

    this.clearMessages();
    this.respondingReviewId = review.id;

    this.reviewService
      .respond(review.id, response)
      .subscribe({
        next: updated => {
          this.replaceReview(updated);
          this.responseDrafts[review.id] =
            updated.response ?? '';
          this.respondingReviewId = null;
          this.successMessage =
            'Réponse enregistrée avec succès.';
          this.cdr.detectChanges();
        },
        error: () => {
          this.respondingReviewId = null;
          this.errorMessage =
            'Impossible d’enregistrer la réponse.';
          this.cdr.detectChanges();
        }
      });
  }

  private loadReviews(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reviewService
      .getForOwner(this.salonId)
      .subscribe({
        next: reviews => {
          this.reviews = reviews;

          for (const review of reviews) {
            this.responseDrafts[review.id] =
              review.response ?? '';
          }

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Impossible de charger les avis.';
          this.cdr.detectChanges();
        }
      });
  }

  private replaceReview(
    updated: OwnerReview
  ): void {
    this.reviews = this.reviews.map(
      review =>
        review.id === updated.id
          ? updated
          : review
    );
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}