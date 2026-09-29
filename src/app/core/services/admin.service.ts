import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

export interface AdminUser {
  id: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: AdminUserRole;
  isEmailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUsersPage {
  items: AdminUser[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalAdmins: number;
  confirmedUsers: number;
  totalSalons: number;
  activeSalons: number;
  totalBookings: number;
}

export interface AdminUserDetails {
  id: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: AdminUserRole;
  isEmailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
}

export type AdminUserRole = 'Owner' | 'Admin' | 'Client';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly apiUrl =
    `${API_BASE_URL}/Admin`;

  constructor(
    private http: HttpClient
  ) { }

  getUsers(
    page = 1,
    pageSize = 20,
    search = '',
    role = ''
  ): Observable<AdminUsersPage> {

    const params: Record<string, string | number> = {
      page,
      pageSize
    };

    const normalizedSearch = search.trim();

    if (normalizedSearch) {
      params['search'] = normalizedSearch;
    }

    if (role) {
      params['role'] = role;
    }

    return this.http.get<AdminUsersPage>(
      `${this.apiUrl}/users`,
      { params }
    );
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(
      `${this.apiUrl}/stats`
    );
  }

  getUserById(id: string): Observable<AdminUserDetails> {
    return this.http.get<AdminUserDetails>(
      `${this.apiUrl}/users/${id}`
    );
  }

  updateUserRole(
    id: string,
    role: AdminUserRole
): Observable<AdminUserDetails> {
    const roleValue: Record<AdminUserRole, number> = {
        Owner: 0,
        Admin: 1,
        Client: 2
    };

    return this.http.put<AdminUserDetails>(
        `${this.apiUrl}/users/${id}/role`,
        {
            role: roleValue[role]
        }
    );
}

  updateUserStatus(
    id: string,
    isActive: boolean
  ): Observable<AdminUserDetails> {
    return this.http.put<AdminUserDetails>(
      `${this.apiUrl}/users/${id}/status`,
      {
        isActive
      }
    );
  }
}
