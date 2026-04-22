import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule }   from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CartService }  from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, DividerModule],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  constructor(public cart: CartService, private router: Router) {}

  checkout(): void { this.router.navigate(['/checkout']); }
  remove(id: string): void { this.cart.removeItem(id); }
}
