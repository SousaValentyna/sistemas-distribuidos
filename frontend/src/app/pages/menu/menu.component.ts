import { Component, OnInit }      from '@angular/core';
import { CommonModule }            from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule }              from 'primeng/card';
import { ButtonModule }            from 'primeng/button';
import { MessageService }          from 'primeng/api';
import { RESTAURANTS, Restaurant } from '../../models/restaurant.model';
import { CartService }             from '../../services/cart.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit {
  restaurant!: Restaurant;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    public  cart:   CartService,
    private msg:    MessageService,
  ) {}

  ngOnInit(): void {
    const id    = this.route.snapshot.paramMap.get('id')!;
    const found = RESTAURANTS.find(r => r.id === id);
    if (!found) { this.router.navigate(['/']); return; }
    this.restaurant = found;
  }

  addItem(item: any): void {
    this.cart.addItem(this.restaurant, item);
    this.msg.add({
      severity: 'success',
      summary:  'Adicionado!',
      detail:   item.name,
      life:     1500,
    });
  }
}
