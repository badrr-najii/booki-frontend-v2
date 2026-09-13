import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import {
  DashboardSalon,
  DashboardStats
} from '../models/dashboard.models';
import { SalonDashboardStats, RecentBooking, TopService, TopEmployee, BookingChart } from '../models/salon-dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl =
    'http://localhost:5001/api';

  constructor(
    private http: HttpClient
  ) { }

  getMySalons():
    Observable<DashboardSalon[]> {

    return this.http.get<DashboardSalon[]>(
      `${this.apiUrl}/salons/my`
    );
  }

  getStats():
    Observable<DashboardStats> {

    return this.getMySalons()
      .pipe(
        map(salons => {

          const services =
            salons.reduce(
              (total, salon) =>
                total +
                (salon.services?.length ?? 0),
              0
            );

          const employees =
            salons.reduce(
              (total, salon) =>
                total +
                (salon.employees?.length ?? 0),
              0
            );

          return {
            salons: salons.length,
            services,
            employees
          };
        })
      );
  }

  getSalonStats(
    salonId: string
  ): Observable<SalonDashboardStats> {
    return this.http.get<SalonDashboardStats>(
      `${this.apiUrl}/Dashboard/stats/${salonId}`
    );
  }

  getRecentBookings(
    salonId: string,
    count = 5
  ): Observable<RecentBooking[]> {

    return this.http.get<RecentBooking[]>(
      `${this.apiUrl}/Dashboard/recent-bookings/${salonId}?count=${count}`
    );
  }

  getTopServices(
    salonId: string,
    count = 5
  ): Observable<TopService[]> {

    return this.http.get<TopService[]>(
      `${this.apiUrl}/Dashboard/top-services/${salonId}?count=${count}`
    );
  }
  getTopEmployees(
    salonId: string,
    count = 5
  ): Observable<TopEmployee[]> {

    return this.http.get<TopEmployee[]>(
      `${this.apiUrl}/Dashboard/top-employees/${salonId}?count=${count}`
    );
  }
  getStatusDistribution(
    salonId: string
  ): Observable<Record<string, number>> {

    return this.http.get<Record<string, number>>(
      `${this.apiUrl}/Dashboard/status-distribution/${salonId}`
    );
  }

  getRevenueTrend(
    salonId: string,
    months = 12
  ): Observable<BookingChart[]> {

    return this.http.get<BookingChart[]>(
      `${this.apiUrl}/Dashboard/revenue-trend/${salonId}?months=${months}`
    );
  }

  getBookingsByDay(
    salonId: string,
    days = 30
  ): Observable<BookingChart[]> {

    return this.http.get<BookingChart[]>(
      `${this.apiUrl}/Dashboard/bookings-by-day/${salonId}?days=${days}`
    );
  }

}