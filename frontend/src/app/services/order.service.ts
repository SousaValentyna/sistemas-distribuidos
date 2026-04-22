import { Injectable, inject } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { Observable }         from 'rxjs';
import { Order }              from '../models/order.model';
import { environment }        from '../../environments/environment';

export interface CreateOrderPayload {
  customer:   string;
  restaurant: string;
  items:      { id: string; name: string; quantity: number; price: number }[];
  total:      number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = environment.orderServiceUrl;

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders`, payload);
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/orders/${orderId}`);
  }
}
