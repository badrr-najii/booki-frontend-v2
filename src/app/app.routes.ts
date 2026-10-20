import { Routes } from '@angular/router';

import { Home } from './features/home/pages/home/home';
import { AuthShell } from './features/auth/components/auth-shell/auth-shell';
import { authGuard } from './core/guards/auth.guard';
import { DashboardLayout } from './core/layout/dashboard-layout/dashboard-layout';
import { PublicBooking } from './features/bookings/pages/public-booking/public-booking';
import { PublicLayout } from './core/layout/public-layout/public-layout';
import { ownerGuard } from './core/guards/owner.guard';
import { adminGuard } from './core/guards/admin.guard';
import { PublicSalonDetails } from './features/salons/pages/public-salon-details/public-salon-details';
import { Account } from './features/auth/pages/account/account';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./core/layout/admin-layout/admin-layout')
                .then(m => m.AdminLayout),
        canActivate: [authGuard, adminGuard],
        children: [
            {
                path: 'admin',
                loadComponent: () =>
                    import('./features/admin/pages/admin-dashboard/admin-dashboard')
                        .then(m => m.AdminDashboard)
            },
            {
                path: 'admin/users',
                loadComponent: () =>
                    import('./features/admin/pages/admin-users/admin-users')
                        .then(m => m.AdminUsers)
            },
            {
                path: 'admin/users/:id',
                loadComponent: () =>
                    import('./features/admin/pages/admin-user-details/admin-user-details')
                        .then(m => m.AdminUserDetailsComponent)
            }
         ]
    },
   {
    path: '',
    component: AuthShell,
    children: [
        {
            path: 'login',
            loadComponent: () =>
                import('./features/auth/pages/login/login')
                    .then(m => m.Login)
        },
        {
            path: 'register',
            loadComponent: () =>
                import('./features/auth/pages/register/register')
                    .then(m => m.Register)
        },
        {
            path: 'forgot-password',
            loadComponent: () =>
                import('./features/auth/pages/forgot-password/forgot-password')
                    .then(m => m.ForgotPassword)
        },
        {
            path: 'reset-password',
            loadComponent: () =>
                import('./features/auth/pages/reset-password/reset-password')
                    .then(m => m.ResetPassword)
        },
        {
            path: 'confirm-email',
            loadComponent: () =>
                import('./features/auth/pages/confirm-email/confirm-email')
                    .then(m => m.ConfirmEmail)
        }
    ]
},


{
    path: '',
    loadComponent: () =>
        import('./core/layout/dashboard-layout/dashboard-layout')
            .then(m => m.DashboardLayout),
    canActivate: [authGuard, ownerGuard],
    children: [
        {
            path: 'dashboard',
            loadComponent: () =>
                import('./features/dashboard/pages/dashboard/dashboard')
                    .then(m => m.Dashboard)
        },
        {
            path: 'dashboard/notifications',
            loadComponent: () =>
                import('./features/notifications/pages/owner-notifications/owner-notifications')
                    .then(m => m.OwnerNotifications)
        },
        {
            path: 'dashboard/salons/new',
            loadComponent: () =>
                import('./features/salons/pages/create-salon/create-salon')
                    .then(m => m.CreateSalon)
        },
        {
            path: 'dashboard/salons/:id',
            loadComponent: () =>
                import('./features/salons/pages/salon-details/salon-details')
                    .then(m => m.SalonDetails)
        },
        {
            path: 'dashboard/salons/:id/edit',
            loadComponent: () =>
                import('./features/salons/pages/edit-salon/edit-salon')
                    .then(m => m.EditSalon)
        },
        {
            path: 'dashboard/salons/:id/services/new',
            loadComponent: () =>
                import('./features/salons/pages/create-service/create-service')
                    .then(m => m.CreateService)
        },
        {
            path: 'dashboard/salons/:id/services/:serviceId/edit',
            loadComponent: () =>
                import('./features/salons/pages/edit-service/edit-service')
                    .then(m => m.EditService)
        },
        {
            path: 'dashboard/salons/:id/services',
            loadComponent: () =>
                import('./features/salons/pages/salon-services/salon-services')
                    .then(m => m.SalonServices)
        },
        {
            path: 'dashboard/salons/:id/employees',
            loadComponent: () =>
                import('./features/salons/pages/salon-employees/salon-employees')
                    .then(m => m.SalonEmployees)
        },
        {
            path: 'dashboard/salons/:id/employees/new',
            loadComponent: () =>
                import('./features/salons/pages/create-employee/create-employee')
                    .then(m => m.CreateEmployee)
        },
        {
            path: 'dashboard/salons/:id/employees/:employeeId/edit',
            loadComponent: () =>
                import('./features/salons/pages/edit-employee/edit-employee')
                    .then(m => m.EditEmployee)
        },
        {
            path: 'dashboard/salons/:id/bookings',
            loadComponent: () =>
                import('./features/salons/pages/salon-bookings/salon-bookings')
                    .then(m => m.SalonBookings)
        },
        {
            path: 'dashboard/salons/:id/working-hours',
            loadComponent: () =>
                import('./features/salons/pages/salon-working-hours/salon-working-hours')
                    .then(m => m.SalonWorkingHours)
        },
        {
            path: 'dashboard/salons/:id/reviews',
            loadComponent: () =>
                import('./features/salons/pages/salon-reviews/salon-reviews')
                    .then(m => m.SalonReviews)
        },
        {
            path: 'dashboard/salons/:id/subscription',
            loadComponent: () =>
                import('./features/subscriptions/pages/owner-subscription/owner-subscription')
                    .then(m => m.OwnerSubscription)
        },
        {
            path: 'dashboard/salons/:id/payments',
            loadComponent: () =>
                import('./features/payments/pages/owner-payments/owner-payments')
                    .then(m => m.OwnerPayments)
        },
        {
            path: 'dashboard/salons/:id/export',
            loadComponent: () =>
                import('./features/export/pages/owner-export/owner-export')
                    .then(m => m.OwnerExport)
        },
        {
            path: 'dashboard/salons/:id/bookings/:bookingId/edit',
            loadComponent: () =>
                import('./features/salons/pages/edit-booking/edit-booking')
                    .then(m => m.EditBooking)
        }
    ]
},

{
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
        {
            path: 'account',
            component: Account
        }
    ]
},

    {
        path: '**',
        redirectTo: ''
    }
];
