
import { Component, ElementRef, HostListener, ViewChild, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-admin-layout',
  imports: [
    Navbar,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  readonly isSidebarOpen = signal(false);
  isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  @ViewChild('sidebarToggle') sidebarToggle?: ElementRef<HTMLButtonElement>;

  @HostListener('window:resize')
  onResize(): void {
    this.isDesktop = window.innerWidth >= 1024;
    if (this.isDesktop) this.isSidebarOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isSidebarOpen()) this.closeSidebar(true);
  }

  closeSidebar(restoreFocus = false): void {
    const wasOpen = this.isSidebarOpen();
    this.isSidebarOpen.set(false);
    if (restoreFocus && wasOpen && !this.isDesktop) {
      this.sidebarToggle?.nativeElement.focus();
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(value => !value);
  }
}
