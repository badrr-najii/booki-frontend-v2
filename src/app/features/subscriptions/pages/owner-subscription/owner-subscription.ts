import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  SubscriptionPlan,
  SubscriptionPlanResponse,
  SubscriptionResponse,
  SubscriptionService
} from '../../../../core/services/subscription.service';
import {
  SalonResponse,
  SalonService
} from '../../../../core/services/salon.service';

@Component({
  selector: 'app-owner-subscription',
  imports: [
    RouterLink
  ],
  templateUrl: './owner-subscription.html',
  styleUrl: './owner-subscription.css'
})
export class OwnerSubscription implements OnInit {
  salon: SalonResponse | null = null;
  subscription: SubscriptionResponse | null = null;
  plans: SubscriptionPlanResponse[] = [];

  remainingBookings: number | null = null;
  canAddEmployee: boolean | null = null;

  isLoading = true;
  isCreatingFree = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private subscriptionService: SubscriptionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const salonId = this.route.snapshot.paramMap.get('id');

    if (!salonId) {
      this.errorMessage = 'Identifiant du salon invalide.';
      this.isLoading = false;
      return;
    }

    this.load(salonId);
  }

  createFreeSubscription(): void {
    if (!this.salon || this.isCreatingFree) {
      return;
    }

    this.isCreatingFree = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.subscriptionService
      .createFree(this.salon.id)
      .subscribe({
        next: subscription => {
          this.subscription = subscription;
          this.successMessage =
            'Votre abonnement gratuit est maintenant actif.';
          this.isCreatingFree = false;

          this.loadUsage(this.salon!.id);
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage =
            'Impossible d’activer l’abonnement gratuit.';
          this.isCreatingFree = false;
          this.cdr.detectChanges();
        }
      });
  }

  isCurrentPlan(
    plan: SubscriptionPlanResponse
  ): boolean {
    return this.subscription?.plan === plan.plan;
  }

  isPaidPlan(
    plan: SubscriptionPlanResponse
  ): boolean {
    return plan.plan !== SubscriptionPlan.Free;
  }

  private load(
    salonId: string
  ): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      salon: this.salonService.getById(salonId),
      plans: this.subscriptionService.getAvailablePlans()
    }).subscribe({
      next: result => {
        this.salon = result.salon;
        this.plans = result.plans;
        this.loadCurrentSubscription(salonId);
      },
      error: () => {
        this.errorMessage =
          'Impossible de charger les informations de l’abonnement.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadCurrentSubscription(
    salonId: string
  ): void {
    this.subscriptionService
      .getCurrent(salonId)
      .subscribe({
        next: subscription => {
          this.subscription = subscription;
          this.loadUsage(salonId);
        },
        error: error => {
          if (error.status === 404) {
            this.subscription = null;
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          this.errorMessage =
            'Impossible de charger l’abonnement actuel.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private loadUsage(
    salonId: string
  ): void {
    forkJoin({
      remainingBookings:
        this.subscriptionService.getRemainingBookings(salonId),
      canAddEmployee:
        this.subscriptionService.canAddEmployee(salonId)
    }).subscribe({
      next: result => {
        this.remainingBookings = result.remainingBookings;
        this.canAddEmployee = result.canAddEmployee;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.remainingBookings = null;
        this.canAddEmployee = null;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
