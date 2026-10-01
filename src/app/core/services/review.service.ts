import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  API_BASE_URL
} from '../config/api.config';

export interface PublicReview {
  id: string;
  salonId: string;
  salonName: string;
  clientName: string;
  rating: number;
  comment: string | null;
  response: string | null;
  responseDate: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface SalonRating {
  salonId: string;
  salonName: string;
  averageRating: number;
  totalReviews: number;
  rating5Count: number;
  rating4Count: number;
  rating3Count: number;
  rating2Count: number;
  rating1Count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private readonly baseUrl =
    `${API_BASE_URL}/Reviews`;

  constructor(
    private http: HttpClient
  ) {}

  getPublicBySalon(
    salonId: string
  ): Observable<PublicReview[]> {
    return this.http.get<PublicReview[]>(
      `${this.baseUrl}/salon/${salonId}`
    );
  }

  getSalonRating(
    salonId: string
  ): Observable<SalonRating> {
    return this.http.get<SalonRating>(
      `${this.baseUrl}/salon/${salonId}/rating`
    );
  }
}