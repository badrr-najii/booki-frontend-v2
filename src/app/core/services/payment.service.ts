import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export enum PaymentMethod {
  Card = 0,
  Cmi = 1,
  PayPal = 2,
  Cash = 3
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Refunded = 3,
  Cancelled = 4
}

export interface CreatePaymentRequest {
  bookingId: string;
  method: PaymentMethod;
}

export interface PaymentResponse {
  paymentId: string;
  bookingId: string;
  paymentIntentId?: string | null;
  redirectUrl?: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
  paidAt?: string | null;
  refundedAt?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl =
    `${API_BASE_URL}/Payments`;

  constructor(
    private http: HttpClient
  ) {}

  getBySalon(
    salonId: string
  ): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(
      `${this.apiUrl}/salon/${salonId}`
    );
  }

  createCardCheckout(
    bookingId: string
  ): Observable<PaymentResponse> {
    const request: CreatePaymentRequest = {
      bookingId,
      method: PaymentMethod.Card
    };

    return this.http.post<PaymentResponse>(
      this.apiUrl,
      request
    );
  }

  refund(
    paymentId: string
  ): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.apiUrl}/${paymentId}/refund`,
      {}
    );
  }
}
