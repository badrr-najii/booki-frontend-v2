import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}

export interface WorkingHoursItem {
  id: string;
  salonId: string;
  day: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  dayName: string;
}

export interface CreateWorkingHoursRequest {
  salonId: string;
  day: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface UpdateWorkingHoursRequest {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkingHoursService {

  private readonly apiUrl = `${API_BASE_URL}/WorkingHours`;

  constructor(
    private http: HttpClient
  ) {}

  getBySalon(
    salonId: string
  ): Observable<WorkingHoursItem[]> {

    return this.http.get<WorkingHoursItem[]>(
      `${this.apiUrl}/salon/${salonId}`
    );
  }

  getById(
    id: string
  ): Observable<WorkingHoursItem> {

    return this.http.get<WorkingHoursItem>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: CreateWorkingHoursRequest
  ): Observable<WorkingHoursItem> {

    return this.http.post<WorkingHoursItem>(
      this.apiUrl,
      request
    );
  }

  update(
    id: string,
    request: UpdateWorkingHoursRequest
  ): Observable<WorkingHoursItem> {

    return this.http.put<WorkingHoursItem>(
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

  isOpen(
    salonId: string,
    dateTime?: string
  ): Observable<{
    isOpen: boolean;
    time: string;
  }> {

    const url = dateTime
      ? `${this.apiUrl}/salon/${salonId}/isopen?dateTime=${encodeURIComponent(dateTime)}`
      : `${this.apiUrl}/salon/${salonId}/isopen`;

    return this.http.get<{
      isOpen: boolean;
      time: string;
    }>(url);
  }
}