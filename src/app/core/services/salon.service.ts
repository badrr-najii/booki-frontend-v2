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

export interface UpdateSalonRequest {
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
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

  update(
    id: string,
    request: UpdateSalonRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  createWithImage(
    request: CreateSalonRequest,
    logoImage: File
  ): Observable<SalonResponse> {

    const formData = new FormData();

    formData.append('Name', request.name);
    formData.append('Slug', request.slug);

    if (request.description) {
      formData.append('Description', request.description);
    }

    if (request.address) {
      formData.append('Address', request.address);
    }

    if (request.city) {
      formData.append('City', request.city);
    }

    if (request.phoneNumber) {
      formData.append('PhoneNumber', request.phoneNumber);
    }

    if (request.email) {
      formData.append('Email', request.email);
    }

    if (request.latitude != null) {
      formData.append(
        'Latitude',
        request.latitude.toString()
      );
    }

    if (request.longitude != null) {
      formData.append(
        'Longitude',
        request.longitude.toString()
      );
    }

    formData.append('LogoImage', logoImage);

    return this.http.post<SalonResponse>(
      `${this.apiUrl}/with-image`,
      formData
    );
  }
}