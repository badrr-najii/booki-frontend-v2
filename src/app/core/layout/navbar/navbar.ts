
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

import {
  NotificationService
} from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  isLoggingOut = false;
  unreadCount = 0;

  // Mobile navigation
  isMobileMenuOpen = false;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isOwner()) {
      return;
    }

    this.notificationService
      .unreadCount$
      .subscribe(count => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      });

    this.notificationService
      .getUnreadCount()
      .subscribe({
        error: () => {
          // Counter failure must not block navigation.
        }
      });
  }

  // Open or close mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Close mobile menu
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Close mobile menu with Escape key
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    this.authService
      .logout()
      .subscribe({
        next: () => {
          this.finishLogout();
        },

        error: () => {
          // AuthService already clears
          // the local session in finalize()
          this.finishLogout();
        }
      });
  }

  private finishLogout(): void {
    this.isLoggingOut = false;
    this.notificationService.clearUnreadCount();

    // Close mobile menu after logout
    this.closeMobileMenu();

    this.router.navigate([
      '/login'
    ]);
  }
}
