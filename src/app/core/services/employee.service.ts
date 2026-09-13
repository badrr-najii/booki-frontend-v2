import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
export interface EmployeeItem {
  id: string;
  salonId: string;
  fullName: string;
  phoneNumber?: string | null;
  specialty?: string | null;
  isActive: boolean;
  createdAt: string;
  bookingsCount: number;
}

export interface CreateEmployeeRequest {
  salonId: string;
  fullName: string;
  phoneNumber?: string | null;
  specialty?: string | null;
}

export interface UpdateEmployeeRequest {
  fullName: string;
  phoneNumber?: string | null;
  specialty?: string | null;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly apiUrl = `${API_BASE_URL}/Employees`;

  constructor(
    private http: HttpClient
  ) {}

  getBySalon(
    salonId: string
  ): Observable<EmployeeItem[]> {
    return this.http.get<EmployeeItem[]>(
      `${this.apiUrl}/salon/${salonId}`
    );
  }

  getAllBySalon(
    salonId: string
  ): Observable<EmployeeItem[]> {
    return this.http.get<EmployeeItem[]>(
      `${this.apiUrl}/salon/${salonId}/all`
    );
  }

  getById(
    id: string
  ): Observable<EmployeeItem> {
    return this.http.get<EmployeeItem>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: CreateEmployeeRequest
  ): Observable<EmployeeItem> {
    return this.http.post<EmployeeItem>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: UpdateEmployeeRequest
  ): Observable<EmployeeItem> {
    return this.http.put<EmployeeItem>(
      `${this.apiUrl}/${id}`,
      request
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