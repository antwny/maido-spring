import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../core/services/pedido.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { PedidoResponse } from '../../../core/models/models';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pedidos-page">
      <div class="container">
        <h1 style="margin-bottom:0.5rem">📋 Mis <span class="text-accent">Pedidos</span></h1>
        <p class="text-muted" style="margin-bottom:2.5rem">Historial de tus pedidos en Maido</p>

        <div *ngIf="loading" class="spinner"></div>

        <div *ngIf="!loading && pedidos.length===0" class="empty-state">
          <p style="font-size:3rem">📦</p>
          <h3>Aún no tienes pedidos</h3>
          <p class="text-muted">¡Haz tu primer pedido y disfruta la experiencia Nikkei!</p>
        </div>

        <div *ngIf="!loading" class="pedidos-list">
          <div *ngFor="let p of pedidos" class="pedido-card card">
            <div class="pedido-header card-body">
              <div>
                <h3>Pedido #{{ p.id }}</h3>
                <p class="text-muted" style="font-size:0.85rem">{{ p.fechaPedido | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div style="text-align:right">
                <span class="badge" [ngClass]="badgeClass(p.estado)">{{ p.estado }}</span>
                <p class="price" style="margin-top:0.5rem">S/ {{ p.total | number:'1.2-2' }}</p>
              </div>
            </div>
            <div class="pedido-items">
              <div *ngFor="let d of p.detalles" class="detalle-row">
                <span>{{ d.platilloNombre }} <b>x{{ d.cantidad }}</b></span>
                <span class="text-muted">S/ {{ d.subtotal | number:'1.2-2' }}</span>
              </div>
            </div>
            <div class="pedido-footer">
              <span class="text-muted" style="font-size:0.85rem">📍 {{ p.direccionEntrega }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pedidos-page { padding-top:6rem; padding-bottom:4rem; min-height:100vh; }
    .pedidos-list { display:flex; flex-direction:column; gap:1.5rem; max-width:800px; }
    .pedido-card { overflow:hidden; }
    .pedido-header { display:flex; justify-content:space-between; align-items:flex-start; }
    .pedido-items { padding:0 1.25rem; border-top:1px solid var(--border); }
    .detalle-row { display:flex; justify-content:space-between; padding:0.65rem 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.9rem; }
    .detalle-row:last-child { border:none; }
    .pedido-footer { padding:0.75rem 1.25rem; background:rgba(0,0,0,0.15); }
    .empty-state { text-align:center; padding:4rem; }
  `]
})
export class MisPedidosComponent implements OnInit {
  private pedidoSvc = inject(PedidoService);
  private authState = inject(AuthStateService);

  pedidos: PedidoResponse[] = [];
  loading = true;

  ngOnInit(): void {
    const id = this.authState.currentUser?.id;
    if (!id) return;
    this.pedidoSvc.getAll({ usuarioId: id }).subscribe({
      next: (p: PedidoResponse[]) => { this.pedidos = p; this.loading = false; },
      error: (err: any) => this.loading = false
    });
  }

  badgeClass(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'badge-warning', 'EN_PREPARACION': 'badge-warning',
      'EN_CAMINO': 'badge-gold', 'ENTREGADO': 'badge-success', 'CANCELADO': 'badge-danger'
    };
    return 'badge ' + (map[estado] ?? 'badge-gold');
  }
}
