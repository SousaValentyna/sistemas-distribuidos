import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./app/pages/restaurant-list/restaurant-list.component').then(
        m => m.RestaurantListComponent
      ),
  },
  {
    path: 'menu/:id',
    loadComponent: () =>
      import('./app/pages/menu/menu.component').then(m => m.MenuComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./app/pages/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./app/pages/checkout/checkout.component').then(
        m => m.CheckoutComponent
      ),
  },
  {
    path: 'track/:id',
    loadComponent: () =>
      import('./app/pages/order-tracking/order-tracking.component').then(
        m => m.OrderTrackingComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
