import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export enum SubscriptionPlan {
  Free = 0,
  Trial = 1,
  Basic = 2,
  Pro = 3,
  Premium = 4
}

export enum SubscriptionStatus {
  Active = 0,
  Cancelled = 1,
  Expired = 2,
  Suspended = 3
}

export interface PlanLimits {
  plan: SubscriptionPlan;
  name: string;
  price: number;
  maxSalons: number;
  maxEmployees: number;
  maxBookingsPerMonth: number;
  hasAdvancedStats: boolean;
  hasExport: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  hasVipSupport: boolean;
  hasCustomIntegration: boolean;
  hasNoCommission: boolean;
}

export interface SubscriptionPlanResponse {
  plan: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  maxSalons: number;
  maxEmployees: number;
  maxBookingsPerMonth: number;
  isPopular: boolean;
  features: string[];
}

export interface SubscriptionResponse {
  id: string;
  salonId: string;
  salonName: string;
  plan: SubscriptionPlan;
  planName: string;
  status: SubscriptionStatus;
  statusName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isExpired: boolean;
  price: number;
  currency: string;
  limits: PlanLimits;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly apiUrl = `${API_BASE_URL}/subscriptions`;

  constructor(
    private http: HttpClient
  ) { }

  getAvailablePlans(): Observable<SubscriptionPlanResponse[]> {
    return this.http.get<SubscriptionPlanResponse[]>(
      `${this.apiUrl}/plans`
    );
  }

  getCurrent(
    salonId: string
  ): Observable<SubscriptionResponse> {
    return this.http.get<SubscriptionResponse>(
      `${this.apiUrl}/salon/${salonId}/current`
    );
  }

  createFree(
    salonId: string
  ): Observable<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(
      this.apiUrl,
      {
        salonId,
        plan: SubscriptionPlan.Free
      }
    );
  }


  getRemainingBookings(
  salonId: string
): Observable<number> {
  return this.http
    .get<{ remaining: number }>(
      `${this.apiUrl}/${salonId}/remaining-bookings`
    )
    .pipe(
      map(response => response.remaining)
    );
}

canAddEmployee(
  salonId: string
): Observable<boolean> {
  return this.http
    .get<{ canAdd: boolean }>(
      `${this.apiUrl}/${salonId}/can-add-employee`
    )
    .pipe(
      map(response => response.canAdd)
    );
}

 canAddSalon(
  salonId: string
): Observable<boolean> {
  return this.http
    .get<{ canAdd: boolean }>(
      `${this.apiUrl}/${salonId}/can-add-salon`
    )
    .pipe(
      map(response => response.canAdd)
    );
}
}
