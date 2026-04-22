import { Component }      from '@angular/core';
import { CommonModule }   from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardModule }     from 'primeng/card';
import { ButtonModule }   from 'primeng/button';
import { BadgeModule }    from 'primeng/badge';
import { RippleModule }   from 'primeng/ripple';
import { RESTAURANTS }    from '../../models/restaurant.model';
import { CartService }    from '../../services/cart.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, BadgeModule, RippleModule],
  templateUrl: './restaurant-list.component.html',
})
export class RestaurantListComponent {
  restaurants = RESTAURANTS;

  constructor(private router: Router, public cart: CartService) {}

  goToMenu(id: string): void {
    this.router.navigate(['/menu', id]);
  }
}
