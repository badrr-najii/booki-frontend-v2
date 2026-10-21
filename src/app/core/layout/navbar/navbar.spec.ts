
import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  of
} from 'rxjs';

import {
  vi
} from 'vitest';

import {
  AuthService
} from '../../services/auth.service';

import {
  NotificationService
} from '../../services/notification.service';

import {
  Navbar
} from './navbar';

import {
  Component
} from '@angular/core';

@Component({
  standalone: true,
  template: ''
})
class TestPage {}


describe('Navbar mobile navigation', () => {
  let fixture: ComponentFixture<Navbar>;
  let component: Navbar;

  const authMock = {
    isAuthenticated: vi.fn(() => false),
    isOwner: vi.fn(() => false),
    isAdmin: vi.fn(() => false),
    logout: vi.fn(() => of({ message: 'OK' }))
  };

  const notificationMock = {
    unreadCount$: of(0),
    getUnreadCount: vi.fn(() => of({ count: 0 })),
    clearUnreadCount: vi.fn()
  };

  async function refreshView(): Promise<void> {
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    authMock.isAuthenticated.mockReturnValue(false);
    authMock.isOwner.mockReturnValue(false);
    authMock.isAdmin.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([
  {
    path: 'login',
    component: TestPage
  }
]),
        {
          provide: AuthService,
          useValue: authMock
        },
        {
          provide: NotificationService,
          useValue: notificationMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;

    await refreshView();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the mobile menu', async () => {
    expect(component.isMobileMenuOpen).toBe(false);

    component.toggleMobileMenu();
    await refreshView();

    expect(component.isMobileMenuOpen).toBe(true);

    const button = fixture.nativeElement.querySelector(
      'button[aria-controls="mobile-navigation"]'
    ) as HTMLButtonElement;

    expect(button.getAttribute('aria-expanded')).toBe('true');

    component.closeMobileMenu();
    await refreshView();

    expect(component.isMobileMenuOpen).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should display guest mobile links', () => {
    const menu = fixture.nativeElement.querySelector(
      '#mobile-navigation'
    ) as HTMLElement;

    expect(menu.textContent).toContain('Accueil');
    expect(menu.textContent).toContain('Découvrir les salons');
    expect(menu.textContent).toContain('Se connecter');
    expect(menu.textContent).toContain('Créer un compte');
  });

  it('should close the menu when a link is clicked', async () => {
    component.toggleMobileMenu();
    await refreshView();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll(
        '#mobile-navigation a'
      )
    ) as HTMLAnchorElement[];

    const loginLink = links.find(link =>
      link.textContent?.includes('Se connecter')
    );

    expect(loginLink).toBeTruthy();

    loginLink!.click();
    await refreshView();

    expect(component.isMobileMenuOpen).toBe(false);
  });

  it('should show owner links for an authenticated owner', async () => {
    authMock.isAuthenticated.mockReturnValue(true);
    authMock.isOwner.mockReturnValue(true);

    await refreshView();

    const menu = fixture.nativeElement.querySelector(
      '#mobile-navigation'
    ) as HTMLElement;

    expect(menu.textContent).toContain('Dashboard');
    expect(menu.textContent).toContain('Notifications');
    expect(menu.textContent).toContain('Mon compte');
    expect(menu.textContent).not.toContain('Créer un compte');
  });

  it('should show administration for an admin', async () => {
    authMock.isAuthenticated.mockReturnValue(true);
    authMock.isAdmin.mockReturnValue(true);

    await refreshView();

    const menu = fixture.nativeElement.querySelector(
      '#mobile-navigation'
    ) as HTMLElement;

    expect(menu.textContent).toContain('Administration');
    expect(menu.textContent).toContain('Mon compte');
  });

  it('should call logout for an authenticated user', async () => {
    authMock.isAuthenticated.mockReturnValue(true);

    await refreshView();

    component.toggleMobileMenu();
    await refreshView();

    component.logout();
    await refreshView();

    expect(authMock.logout).toHaveBeenCalledTimes(1);

    expect(notificationMock.clearUnreadCount)
      .toHaveBeenCalledTimes(1);

    expect(component.isMobileMenuOpen).toBe(false);
    expect(component.isLoggingOut).toBe(false);
  });
});
