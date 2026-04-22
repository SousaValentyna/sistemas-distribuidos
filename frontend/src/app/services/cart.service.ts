import { Injectable, signal, computed } from '@angular/core';
import { Cart, CartItem }               from '../models/cart.model';
import { MenuItem, Restaurant }         from '../models/restaurant.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  cart = signal<Cart>({ restaurant: null, items: [] });

  itemCount = computed(() =>
    this.cart().items.reduce((sum, i) => sum + i.quantity, 0)
  );

  total = computed(() =>
    this.cart().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0)
  );

  addItem(restaurant: Restaurant, item: MenuItem): void {
    const current = this.cart();

    // Clear cart when switching restaurants
    if (current.restaurant && current.restaurant.id !== restaurant.id) {
      this.cart.set({ restaurant, items: [{ menuItem: item, quantity: 1 }] });
      return;
    }

    const existing = current.items.find(i => i.menuItem.id === item.id);
    if (existing) {
      this.cart.set({
        restaurant,
        items: current.items.map(i =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      this.cart.set({
        restaurant,
        items: [...current.items, { menuItem: item, quantity: 1 }],
      });
    }
  }

  removeItem(itemId: string): void {
    const current = this.cart();
    this.cart.set({
      ...current,
      items: current.items.filter(i => i.menuItem.id !== itemId),
    });
  }

  clear(): void {
    this.cart.set({ restaurant: null, items: [] });
  }
}
