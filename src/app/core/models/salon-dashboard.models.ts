export interface SalonDashboardStats {
  totalBookings: number;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;

  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;

  totalClients: number;
  newClientsThisMonth: number;

  totalEmployees: number;
  totalServices: number;

  bookingRate: number;
  cancellationRate: number;
  completionRate: number;
}

export interface RecentBooking {
  id: string;
  clientName: string;
  serviceName: string;
  bookingDate: string;
  startTime: string;
  price: number;
  status: number;
}

export interface TopService {
  serviceName: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface TopEmployee {
  employeeName: string;
  bookingsCount: number;
  revenue: number;
}

export interface BookingChart {
  label: string;
  count: number;
  revenue: number;
}