import { Routes } from '@angular/router';

import { Home } from './features/home/pages/home/home';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { AuthShell } from './features/auth/components/auth-shell/auth-shell';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { DashboardLayout } from './core/layout/dashboard-layout/dashboard-layout';
import { CreateSalon } from './features/salons/pages/create-salon/create-salon';
import { SalonDetails } from './features/salons/pages/salon-details/salon-details';
import { SalonServices } from './features/salons/pages/salon-services/salon-services';
import { CreateService } from './features/salons/pages/create-service/create-service';
import { EditService } from './features/salons/pages/edit-service/edit-service';
import { SalonEmployees } from './features/salons/pages/salon-employees/salon-employees';
import { CreateEmployee } from './features/salons/pages/create-employee/create-employee';
import { EditEmployee } from './features/salons/pages/edit-employee/edit-employee';
import { SalonBookings } from './features/salons/pages/salon-bookings/salon-bookings';
import { SalonWorkingHours } from './features/salons/pages/salon-working-hours/salon-working-hours';
import { PublicBooking } from './features/bookings/pages/public-booking/public-booking';
import { EditBooking } from './features/salons/pages/edit-booking/edit-booking';
import { EditSalon } from './features/salons/pages/edit-salon/edit-salon';
import { PublicLayout } from './core/layout/public-layout/public-layout';
import { ownerGuard } from './core/guards/owner.guard';
import { adminGuard } from './core/guards/admin.guard';
import { AdminLayout } from './core/layout/admin-layout/admin-layout';
import { AdminUsers } from './features/admin/pages/admin-users/admin-users';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                component: Home
            },
            {
                path: 'salons/:id/book',
                component: PublicBooking
            }
        ]
    },
    {
        path: '',
        component: AuthShell,
        children: [
            {
                path: 'login',
                component: Login
            },
            {
                path: 'register',
                component: Register
            }
        ]
    },

    {
        path: '',
        component: DashboardLayout,
        canActivate: [authGuard, ownerGuard],
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'dashboard/salons/new',
                component: CreateSalon
            },
            {
                path: 'dashboard/salons/:id',
                component: SalonDetails
            },
            {
                path: 'dashboard/salons/:id/edit',
                component: EditSalon
            },
            {
                path: 'dashboard/salons/:id/services/new',
                component: CreateService
            },
            {
                path: 'dashboard/salons/:id/services/:serviceId/edit',
                component: EditService
            },
            {
                path: 'dashboard/salons/:id/services',
                component: SalonServices
            },
            {
                path: 'dashboard/salons/:id/employees',
                component: SalonEmployees
            },

            {
                path: 'dashboard/salons/:id/employees/new',
                component: CreateEmployee
            },
            {
                path: 'dashboard/salons/:id/employees/:employeeId/edit',
                component: EditEmployee
            },
            {
                path: 'dashboard/salons/:id/bookings',
                component: SalonBookings
            },
            {
                path: 'dashboard/salons/:id/working-hours',
                component: SalonWorkingHours
            },
            {
                path: 'dashboard/salons/:id/bookings/:bookingId/edit',
                component: EditBooking
            },
        ]
    },

    {
        path: '',
        component: AdminLayout,
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: 'admin',
                component: AdminUsers
            }
        ]
    },


    {
        path: '**',
        redirectTo: ''
    }
];