import { MenuItem, Restaurant } from './restaurant.model';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  restaurant: Restaurant | null;
  items:      CartItem[];
}
