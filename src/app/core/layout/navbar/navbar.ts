import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  isLoggingOut = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {

    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    this.authService
      .logout()
      .subscribe({
        next: () => {
          this.isLoggingOut = false;

          this.router.navigate([
            '/login'
          ]);
        },

        error: () => {
          this.isLoggingOut = false;

          // AuthService already clears
          // the local session in finalize()
          this.router.navigate([
            '/login'
          ]);
        }
      });
  }
}