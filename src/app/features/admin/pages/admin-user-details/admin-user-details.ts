import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    inject
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
    AdminService,
    AdminUserDetails,
    AdminUserRole
} from '../../../../core/services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-user-details',
    imports: [DatePipe, RouterLink, FormsModule],
    templateUrl: './admin-user-details.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUserDetailsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly adminService = inject(AdminService);
    private readonly cdr = inject(ChangeDetectorRef);

    user: AdminUserDetails | null = null;
    loading = true;
    error = '';

    selectedRole: AdminUserRole = 'Owner';
    savingRole = false;
    roleError = '';
    roleSuccess = '';
    savingStatus = false;
    statusError = '';
    statusSuccess = '';

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        if (!id) {
            this.loading = false;
            this.error = 'Utilisateur introuvable.';
            return;
        }

        this.adminService.getUserById(id).subscribe({
            next: (user) => {
                this.user = user;
                this.selectedRole = user.role;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;

                this.error =
                    error.status === 404
                        ? 'Utilisateur introuvable.'
                        : 'Impossible de charger cet utilisateur.';

                this.cdr.markForCheck();
            }
        });
    }

    updateRole(): void {
        if (
            !this.user ||
            this.savingRole ||
            this.selectedRole === this.user.role
        ) {
            return;
        }

        this.savingRole = true;
        this.roleError = '';
        this.roleSuccess = '';

        this.adminService
            .updateUserRole(
                this.user.id,
                this.selectedRole
            )
            .subscribe({
                next: user => {
                    this.user = user;
                    this.selectedRole = user.role;
                    this.savingRole = false;
                    this.roleSuccess =
                        'Role mis a jour.';
                    this.cdr.markForCheck();
                },

                error: error => {
                    this.savingRole = false;

                    this.roleError =
                        error.status === 400
                            ? 'Modification du role refusee.'
                            : 'Impossible de modifier le role.';

                    this.selectedRole =
                        this.user!.role;

                    this.cdr.markForCheck();
                }
            });
    }
    updateStatus(): void {
        if (!this.user || this.savingStatus) {
            return;
        }

        const nextStatus = !this.user.isActive;

        this.savingStatus = true;
        this.statusError = '';
        this.statusSuccess = '';

        this.adminService
            .updateUserStatus(
                this.user.id,
                nextStatus
            )
            .subscribe({
                next: user => {
                    this.user = user;
                    this.selectedRole = user.role;
                    this.savingStatus = false;
                    this.statusSuccess = user.isActive
                        ? 'Compte active.'
                        : 'Compte desactive.';
                    this.cdr.markForCheck();
                },

                error: error => {
                    this.savingStatus = false;

                    this.statusError =
                        error.status === 400
                            ? 'Vous ne pouvez pas desactiver votre propre compte.'
                            : 'Impossible de modifier le statut du compte.';

                    this.cdr.markForCheck();
                }
            });
    }
}