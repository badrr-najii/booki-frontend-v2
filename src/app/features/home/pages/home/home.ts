
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { Hero } from '../../components/hero/hero';
import { Categories } from '../../components/categories/categories';
import { PopularSalons } from '../../components/popular-salons/popular-salons';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { SalonCta } from '../../components/salon-cta/salon-cta';

import {
  PublicSalonResponse,
  SalonService
} from '../../../../core/services/salon.service';

@Component({
  selector: 'app-home',
  imports: [
    Hero,
    Categories,
    PopularSalons,
    HowItWorks,
    SalonCta
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  salons: PublicSalonResponse[] = [];

  isLoading = true;
  loadFailed = false;

  constructor(
    private salonService: SalonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.salonService.getAllPublic().subscribe({
      next: salons => {
        this.salons = salons;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadFailed = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
