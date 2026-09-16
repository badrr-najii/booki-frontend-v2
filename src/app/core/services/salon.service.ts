import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  SalonServiceItem
} from './service.service';

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

export interface PublicSalonResponse {
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
  services: SalonServiceItem[];
}

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private readonly apiUrl = `${API_BASE_URL}/salons`;
  constructor(
    private http: HttpClient
  ) { }

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

  getAllPublic(): Observable<PublicSalonResponse[]> {
    return this.http.get<PublicSalonResponse[]>(
      this.apiUrl
    );
  }

  getPublicBySlug(
    slug: string
  ): Observable<PublicSalonResponse> {
    return this.http.get<PublicSalonResponse>(
      `${this.apiUrl}/slug/${encodeURIComponent(slug)}`
    );
  }
}