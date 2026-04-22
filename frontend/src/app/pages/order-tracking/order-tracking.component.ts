import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { ActivatedRoute, RouterLink }   from '@angular/router';
import { ButtonModule }                 from 'primeng/button';
import { CardModule }                   from 'primeng/card';
import { TimelineModule }               from 'primeng/timeline';
import { ProgressSpinnerModule }        from 'primeng/progressspinner';
import { DividerModule }                from 'primeng/divider';
import { MessageService }               from 'primeng/api';
import { Subscription, interval, switchMap, startWith } from 'rxjs';
import { OrderService }                 from '../../services/order.service';
import { Order, OrderStatus }           from '../../models/order.model';

interface TimelineEvent {
  label:  string;
  icon:   string;
  color:  string;
  active: boolean;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    ButtonModule, CardModule, TimelineModule,
    ProgressSpinnerModule, DividerModule,
  ],
  templateUrl: './order-tracking.component.html',
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order:         Order | null = null;
  loading        = true;
  seenRetryCount = 0;
  timelineEvents: TimelineEvent[] = [];

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private svc:   OrderService,
    private msg:   MessageService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.sub = interval(2000).pipe(
      startWith(0),
      switchMap(() => this.svc.getOrder(id)),
    ).subscribe({
      next: (order) => {
        this.loading = false;
        this.detectRetries(order);
        this.order          = order;
        this.timelineEvents = this.buildTimeline(order);

        if (['delivered', 'payment_failed'].includes(order.status)) {
          this.sub?.unsubscribe();
          // Final toast
          if (order.status === 'delivered') {
            this.msg.add({
              severity: 'success',
              summary:  '🎉 Pedido confirmado!',
              detail:   `Entregador: ${order.driver}`,
              life:     6000,
            });
          }
        }
      },
      error: () => { this.loading = false; },
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private detectRetries(order: Order): void {
    const newEvents = order.retry_events.slice(this.seenRetryCount);
    newEvents.forEach(evt => {
      this.msg.add({
        severity: 'warn',
        summary:  '🔁 Retentativa Automática',
        detail:   evt,
        life:     6000,
        sticky:   false,
      });
    });
    this.seenRetryCount = order.retry_events.length;
  }

  get isFallback(): boolean {
    return this.order?.status === 'pending_logistics';
  }

  get isPaymentFailed(): boolean {
    return this.order?.status === 'payment_failed';
  }

  get statusLabel(): string {
    const map: Record<OrderStatus, string> = {
      created:             'Pedido Criado',
      payment_processing:  'Processando Pagamento',
      payment_failed:      'Pagamento Recusado',
      logistics_assigning: 'Buscando Entregador',
      pending_logistics:   'Logística Indisponível — Na Fila',
      delivered:           'Saiu para Entrega',
    };
    return this.order ? map[this.order.status] : '';
  }

  get statusClass(): string {
    const s = this.order?.status;
    if (s === 'delivered')         return 'status-delivered';
    if (s === 'payment_failed')    return 'status-failed';
    if (s === 'pending_logistics') return 'status-pending';
    if (s === 'logistics_assigning') return 'status-assigning';
    if (s === 'payment_processing') return 'status-processing';
    return 'status-created';
  }

  private buildTimeline(order: Order): TimelineEvent[] {
    const statuses: OrderStatus[] = [
      'created', 'payment_processing', 'logistics_assigning', 'delivered',
    ];
    const labels = [
      'Pedido Recebido',
      'Pagamento',
      'Logística',
      'Saiu para Entrega',
    ];
    const icons  = ['pi pi-shopping-cart', 'pi pi-credit-card', 'pi pi-car', 'pi pi-check-circle'];
    const colors = ['#7c3aed', '#f59e0b', '#2563eb', '#16a34a'];

    const current = order.status;
    const idx     = statuses.indexOf(current as OrderStatus);

    return statuses.map((s, i) => ({
      label:  labels[i],
      icon:   icons[i],
      color:  colors[i],
      active: i <= idx || (current === 'delivered'),
    }));
  }
}
