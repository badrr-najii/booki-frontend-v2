import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateSalonRequest {
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface SalonResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ownerId: string;
  ownerName?: string | null;
  isActive: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private readonly apiUrl =
    'http://localhost:5001/api/salons';

  constructor(
    private http: HttpClient
  ) {}

  create(
    request: CreateSalonRequest
  ): Observable<SalonResponse> {
    return this.http.post<SalonResponse>(
      this.apiUrl,
      request
    );
  }

  getById(
    id: string
  ): Observable<SalonResponse> {
    return this.http.get<SalonResponse>(
      `${this.apiUrl}/${id}`
    );
  }
}