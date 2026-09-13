export interface DashboardService {
  id: string;
  salonId: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string | null;
  isActive: boolean;
}

export interface DashboardEmployee {
  id: string;
  salonId: string;
  fullName: string;
  phoneNumber?: string | null;
  specialty?: string | null;
  isActive: boolean;
}

export interface DashboardSalon {
  id: string;
  name: string;
  slug: string;

  description?: string | null;
  address?: string | null;
  city?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  logoUrl?: string | null;

  ownerId: string;
  ownerName?: string | null;

  isActive: boolean;
  createdAt: string;

  servicesCount: number;

  services: DashboardService[];
  employees: DashboardEmployee[];
}

export interface DashboardStats {
  salons: number;
  services: number;
  employees: number;
}