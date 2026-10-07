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

export type ExportFormat =
  | 'excel'
  | 'pdf';

export type ExportType =
  | 'bookings'
  | 'payments'
  | 'salons'
  | 'employees'
  | 'services';

export interface ExportFilter {
  salonId: string;
  startDate?: string | null;
  endDate?: string | null;
  format: ExportFormat;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private readonly apiUrl =
    `${API_BASE_URL}/Export`;

  constructor(
    private http: HttpClient
  ) {}

  export(
    type: ExportType,
    filter: ExportFilter
  ): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/${type}`,
      filter,
      {
        responseType: 'blob'
      }
    );
  }
}