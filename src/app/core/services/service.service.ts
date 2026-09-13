import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalonServiceItem {
  id: string;
  salonId: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string | null;
  isActive: boolean;
}

export interface CreateServiceRequest {
  salonId: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateServiceRequest {
  name: string;
  price: number;
  durationMinutes: number;
  description?: string | null;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private readonly apiUrl =
    'http://localhost:5001/api/Services';

  constructor(
    private http: HttpClient
  ) { }

  getBySalon(
    salonId: string
  ): Observable<SalonServiceItem[]> {
    return this.http.get<SalonServiceItem[]>(
      `${this.apiUrl}/salon/${salonId}`
    );
  }

  getById(
    id: string
  ): Observable<SalonServiceItem> {
    return this.http.get<SalonServiceItem>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: CreateServiceRequest
  ): Observable<SalonServiceItem> {
    return this.http.post<SalonServiceItem>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: UpdateServiceRequest
  ): Observable<SalonServiceItem> {
    return this.http.put<SalonServiceItem>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  getAllBySalon(
    salonId: string
  ): Observable<SalonServiceItem[]> {
    return this.http.get<SalonServiceItem[]>(
      `${this.apiUrl}/salon/${salonId}/all`
    );
  }


  delete(
    id: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}