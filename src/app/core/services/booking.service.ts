import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export enum BookingStatus {
    Pending = 0,
    Confirmed = 1,
    Completed = 2,
    Cancelled = 3,
    NoShow = 4
}

export interface BookingItem {
    id: string;
    salonId: string;
    salonName: string;

    serviceId: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;

    employeeId?: string | null;
    employeeName?: string | null;

    bookingDate: string;
    startTime: string;
    endTime: string;

    clientName: string;
    clientPhone: string;
    clientEmail?: string | null;

    notes?: string | null;

    status: BookingStatus;
    statusName: string;

    createdAt: string;
}

export interface UpdateBookingRequest {
    employeeId?: string | null;
    removeEmployee?: boolean;
    bookingDate?: string | null;
    startTime?: string | null;
    clientName?: string | null;
    clientPhone?: string | null;
    clientEmail?: string | null;
    notes?: string | null;
}

export interface AvailableSlot {
    date: string;
    startTime: string;
    endTime: string;
    employeeId?: string | null;
    employeeName?: string | null;
}

export interface CreateBookingRequest {
    salonId: string;
    serviceId: string;
    employeeId?: string | null;
    bookingDate: string;
    startTime: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string | null;
    notes?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {

private readonly apiUrl = `${API_BASE_URL}/Bookings`;

    constructor(
        private http: HttpClient
    ) { }

    getBySalon(
        salonId: string
    ): Observable<BookingItem[]> {

        return this.http.get<BookingItem[]>(
            `${this.apiUrl}/salon/${salonId}`
        );
    }

    getById(
        id: string
    ): Observable<BookingItem> {

        return this.http.get<BookingItem>(
            `${this.apiUrl}/${id}`
        );
    }

    update(
        id: string,
        request: UpdateBookingRequest
    ): Observable<BookingItem> {

        return this.http.put<BookingItem>(
            `${this.apiUrl}/${id}`,
            request
        );
    }

    confirm(
        id: string
    ): Observable<BookingItem> {

        return this.http.patch<BookingItem>(
            `${this.apiUrl}/${id}/confirm`,
            {}
        );
    }

    cancel(
        id: string
    ): Observable<BookingItem> {

        return this.http.patch<BookingItem>(
            `${this.apiUrl}/${id}/cancel`,
            {}
        );
    }

    complete(
        id: string
    ): Observable<BookingItem> {

        return this.http.patch<BookingItem>(
            `${this.apiUrl}/${id}/complete`,
            {}
        );
    }

    delete(
        id: string
    ): Observable<void> {

        return this.http.delete<void>(
            `${this.apiUrl}/${id}`
        );
    }

    getAvailableSlots(
        salonId: string,
        date: string,
        serviceId?: string,
        employeeId?: string
    ): Observable<AvailableSlot[]> {

        let url =
            `${this.apiUrl}/available-slots` +
            `?salonId=${encodeURIComponent(salonId)}` +
            `&date=${encodeURIComponent(date)}`;

        if (serviceId) {
            url +=
                `&serviceId=${encodeURIComponent(serviceId)}`;
        }

        if (employeeId) {
            url +=
                `&employeeId=${encodeURIComponent(employeeId)}`;
        }

        return this.http.get<AvailableSlot[]>(url);
    }

    getAvailableSlotsForEdit(
        bookingId: string,
        date: string,
        employeeId?: string
    ): Observable<AvailableSlot[]> {

        let url =
            `${this.apiUrl}/${bookingId}/available-slots` +
            `?date=${encodeURIComponent(date)}`;

        if (employeeId) {
            url +=
                `&employeeId=${encodeURIComponent(employeeId)}`;
        }

        return this.http.get<AvailableSlot[]>(url);
    }

    create(
        request: CreateBookingRequest
    ): Observable<BookingItem> {

        return this.http.post<BookingItem>(
            this.apiUrl,
            request
        );
    }
    noShow(
        id: string
    ): Observable<BookingItem> {

        return this.http.patch<BookingItem>(
            `${this.apiUrl}/${id}/no-show`,
            {}
        );
    }
}