import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { Categories } from '../../components/categories/categories';
import { PopularSalons } from '../../components/popular-salons/popular-salons';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { SalonCta } from '../../components/salon-cta/salon-cta';


@Component({
  selector: 'app-home',
  imports: [Hero, Categories, PopularSalons, HowItWorks, SalonCta],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}