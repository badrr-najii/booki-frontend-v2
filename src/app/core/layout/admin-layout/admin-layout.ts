import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-admin-layout',
  imports: [
    Navbar,
    RouterOutlet
  ],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {}