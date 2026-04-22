import { Component }            from '@angular/core';
import { CommonModule }          from '@angular/common';
import { FormsModule }           from '@angular/forms';
import { Router, RouterLink }    from '@angular/router';
import { ButtonModule }          from 'primeng/button';
import { InputTextModule }       from 'primeng/inputtext';
import { CardModule }            from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule }         from 'primeng/divider';
import { CartService }           from '../../services/cart.service';
import { OrderService }          from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, InputTextModule, CardModule,
    ProgressSpinnerModule, DividerModule,
  ],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  customerName = '';
  loading      = false;
  error        = '';

  constructor(
    public  cart:   CartService,
    private orders: OrderService,
    private router: Router,
  ) {}

  placeOrder(): void {
    if (!this.customerName.trim()) {
      this.error = 'Por favor, informe seu nome.';
      return;
    }

    this.loading = true;
    this.error   = '';

    const cartData = this.cart.cart();
    const payload  = {
      customer:   this.customerName.trim(),
      restaurant: cartData.restaurant!.name,
      items:      cartData.items.map(i => ({
        id:       i.menuItem.id,
        name:     i.menuItem.name,
        quantity: i.quantity,
        price:    i.menuItem.price,
      })),
      total: this.cart.total(),
    };

    this.orders.createOrder(payload).subscribe({
      next: (order) => {
        this.cart.clear();
        this.router.navigate(['/track', order.id]);
      },
      error: () => {
        this.loading = false;
        this.error   = 'Falha ao criar pedido. Tente novamente.';
      },
    });
  }
}
