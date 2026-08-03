import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { PedidoResponse } from '../../../core/models/models';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pedidos-page">
      <div class="container">
        <h1 style="margin-bottom:0.5rem">📋 Mis <span class="text-accent">Pedidos</span></h1>
        <p class="text-muted" style="margin-bottom:2rem">Historial de tus pedidos en Maido</p>

        <!-- Filtros -->
        <div class="filter-chips">
          <button *ngFor="let f of filters"
                  class="chip"
                  [class.active]="activeFilter === f.value"
                  (click)="setFilter(f.value)">
            {{ f.icon }} {{ f.label }}
            <span class="chip-count" *ngIf="getCount(f.value) > 0">{{ getCount(f.value) }}</span>
          </button>
        </div>

        <div *ngIf="loading" class="spinner"></div>

        <!-- Empty State -->
        <div *ngIf="!loading && filtered.length === 0" class="empty-state">
          <div class="empty-icon">🍱</div>
          <h3 *ngIf="pedidos.length === 0">Aún no tienes pedidos</h3>
          <h3 *ngIf="pedidos.length > 0">Sin pedidos en este filtro</h3>
          <p class="text-muted" *ngIf="pedidos.length === 0">¡Haz tu primer pedido y disfruta la experiencia Nikkei!</p>
          <a routerLink="/catalogo" class="btn btn-primary" style="margin-top:1.5rem" *ngIf="pedidos.length === 0">
            Explorar el menú →
          </a>
          <button class="btn btn-ghost" style="margin-top:1rem" *ngIf="pedidos.length > 0" (click)="setFilter('TODOS')">
            Ver todos los pedidos
          </button>
        </div>

        <!-- Lista -->
        <div *ngIf="!loading && filtered.length > 0" class="pedidos-list">
          <div *ngFor="let p of filtered; let i = index" class="pedido-card card" [class.expanded]="expandedId === p.id">

            <!-- Header (clickeable) -->
            <div class="pedido-header" (click)="toggle(p.id!)">
              <div class="header-left">
                <h3 class="pedido-num">Pedido #{{ p.id }}</h3>
                <span class="pedido-date">{{ p.fechaPedido | date:'dd MMM yyyy, HH:mm' }}</span>
              </div>
              <div class="header-right">
                <span class="badge" [ngClass]="badgeClass(p.estado)">{{ estadoLabel(p.estado) }}</span>
                <span class="pago-badge" *ngIf="getMetodoPago(p)">{{ getMetodoPago(p) }}</span>
                <span class="pedido-total">S/ {{ p.total | number:'1.2-2' }}</span>
              </div>
              <div class="expand-icon" [class.rotated]="expandedId === p.id">▾</div>
            </div>

            <!-- Timeline -->
            <div class="timeline-bar" *ngIf="p.estado !== 'CANCELADO'">
              <div *ngFor="let step of timelineSteps; let si = index" class="tl-step" [class.done]="isStepDone(p.estado, si)" [class.current]="isStepCurrent(p.estado, si)">
                <div class="tl-dot"></div>
                <span class="tl-label">{{ step.label }}</span>
              </div>
              <div class="tl-track">
                <div class="tl-fill" [style.width]="timelinePercent(p.estado)"></div>
              </div>
            </div>
            <div class="timeline-cancelled" *ngIf="p.estado === 'CANCELADO'">
              ❌ Pedido cancelado
            </div>

            <!-- Detalle expandible -->
            <div class="pedido-body" *ngIf="expandedId === p.id">
              <div class="pedido-items">
                <div *ngFor="let d of p.detalles" class="detalle-row">
                  <span>{{ d.platilloNombre }} <b>x{{ d.cantidad }}</b></span>
                  <span class="text-muted">S/ {{ d.subtotal | number:'1.2-2' }}</span>
                </div>
              </div>
              <div class="pedido-footer">
                <div class="footer-row">
                  <span>📍 {{ p.direccionEntrega }}</span>
                </div>
                <div class="footer-row obs" *ngIf="getObservaciones(p)">
                  <span>📝 {{ getObservaciones(p) }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pedidos-page { padding-top:6rem; padding-bottom:4rem; min-height:100vh; }

    /* Filtros */
    .filter-chips { display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:2rem; }
    .chip {
      display:inline-flex; align-items:center; gap:0.4rem;
      padding:0.45rem 1rem; border-radius:100px;
      background:var(--bg-card); border:1px solid var(--border);
      color:var(--text-muted); font-size:0.85rem; cursor:pointer;
      transition:all 0.2s ease; font-family:inherit;
    }
    .chip:hover { border-color:rgba(224,169,109,0.4); color:var(--text-primary); }
    .chip.active { background:rgba(224,169,109,0.12); border-color:var(--accent-gold); color:var(--accent-gold); font-weight:600; }
    .chip-count {
      background:rgba(255,255,255,0.1); padding:0 6px; border-radius:100px;
      font-size:0.75rem; min-width:20px; text-align:center;
    }
    .chip.active .chip-count { background:rgba(224,169,109,0.2); }

    /* Empty */
    .empty-state { text-align:center; padding:4rem 2rem; }
    .empty-icon { font-size:4rem; margin-bottom:1rem; animation:float 3s ease-in-out infinite; }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }

    /* Lista */
    .pedidos-list { display:flex; flex-direction:column; gap:1rem; max-width:850px; }

    /* Card */
    .pedido-card { overflow:hidden; transition:all 0.25s ease; border:1px solid var(--border); }
    .pedido-card:hover { border-color:rgba(224,169,109,0.25); }
    .pedido-card.expanded { border-color:rgba(224,169,109,0.4); box-shadow:0 4px 20px rgba(0,0,0,0.3); }

    /* Header */
    .pedido-header {
      display:flex; align-items:center; padding:1.25rem;
      cursor:pointer; user-select:none; gap:1rem;
    }
    .header-left { flex:1; }
    .pedido-num { font-size:1rem; font-weight:700; margin-bottom:0.2rem; }
    .pedido-date { font-size:0.8rem; color:var(--text-muted); }
    .header-right { display:flex; flex-direction:column; align-items:flex-end; gap:0.4rem; }
    .pedido-total { font-size:1.1rem; font-weight:700; color:var(--accent-gold); }
    .pago-badge {
      font-size:0.7rem; padding:2px 8px; border-radius:100px;
      background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
      color:var(--text-muted);
    }
    .expand-icon {
      font-size:1.2rem; color:var(--text-muted); transition:transform 0.25s ease;
      margin-left:0.5rem;
    }
    .expand-icon.rotated { transform:rotate(180deg); color:var(--accent-gold); }

    /* Timeline */
    .timeline-bar {
      display:flex; justify-content:space-between; align-items:flex-start;
      padding:0 1.25rem 1rem; position:relative;
    }
    .tl-step { display:flex; flex-direction:column; align-items:center; z-index:1; flex:1; }
    .tl-dot {
      width:14px; height:14px; border-radius:50%;
      background:var(--bg-secondary); border:2px solid var(--border);
      margin-bottom:0.4rem; transition:all 0.3s ease;
    }
    .tl-step.done .tl-dot { background:var(--accent-gold); border-color:var(--accent-gold); box-shadow:0 0 8px rgba(224,169,109,0.4); }
    .tl-step.current .tl-dot { background:var(--accent-gold); border-color:var(--accent-gold); box-shadow:0 0 12px rgba(224,169,109,0.6); animation:pulse 2s infinite; }
    .tl-label { font-size:0.7rem; color:var(--text-muted); text-align:center; }
    .tl-step.done .tl-label, .tl-step.current .tl-label { color:var(--accent-gold); font-weight:600; }
    .tl-track {
      position:absolute; top:6px; left:calc(1.25rem + 7px); right:calc(1.25rem + 7px);
      height:3px; background:var(--border); border-radius:2px; z-index:0;
    }
    .tl-fill {
      height:100%; background:var(--accent-gold); border-radius:2px;
      transition:width 0.5s ease;
    }
    @keyframes pulse { 0%,100% { box-shadow:0 0 8px rgba(224,169,109,0.4); } 50% { box-shadow:0 0 16px rgba(224,169,109,0.7); } }
    .timeline-cancelled {
      padding:0.5rem 1.25rem 1rem; font-size:0.85rem; color:#f87171;
    }

    /* Body expandible */
    .pedido-body { animation:slideDown 0.25s ease forwards; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    .pedido-items { padding:0 1.25rem; border-top:1px solid var(--border); }
    .detalle-row {
      display:flex; justify-content:space-between; padding:0.65rem 0;
      border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.9rem;
    }
    .detalle-row:last-child { border:none; }
    .pedido-footer { padding:0.75rem 1.25rem; background:rgba(0,0,0,0.15); }
    .footer-row { font-size:0.85rem; color:var(--text-muted); padding:0.2rem 0; }
    .footer-row.obs { font-style:italic; opacity:0.8; }

    @media(max-width:600px) {
      .pedido-header { flex-wrap:wrap; }
      .tl-label { font-size:0.6rem; }
      .filter-chips { gap:0.4rem; }
      .chip { padding:0.35rem 0.75rem; font-size:0.8rem; }
    }
  `]
})
export class MisPedidosComponent implements OnInit {
  private pedidoSvc = inject(PedidoService);
  private authState = inject(AuthStateService);

  pedidos: PedidoResponse[] = [];
  filtered: PedidoResponse[] = [];
  loading = true;
  expandedId: number | null = null;
  activeFilter = 'TODOS';

  filters = [
    { value: 'TODOS', label: 'Todos', icon: '📋' },
    { value: 'PENDIENTE', label: 'Pendientes', icon: '⏳' },
    { value: 'EN_PREPARACION', label: 'Preparando', icon: '👨‍🍳' },
    { value: 'EN_CAMINO', label: 'En camino', icon: '🛵' },
    { value: 'ENTREGADO', label: 'Entregados', icon: '✅' },
    { value: 'CANCELADO', label: 'Cancelados', icon: '❌' },
  ];

  timelineSteps = [
    { key: 'PENDIENTE', label: 'Recibido' },
    { key: 'EN_PREPARACION', label: 'Preparando' },
    { key: 'EN_CAMINO', label: 'En camino' },
    { key: 'ENTREGADO', label: 'Entregado' },
  ];

  ngOnInit(): void {
    const id = this.authState.currentUser?.id;
    if (!id) return;
    this.pedidoSvc.getAll({ usuarioId: id }).subscribe({
      next: (p: PedidoResponse[]) => { this.pedidos = p; this.applyFilter(); this.loading = false; },
      error: (err: any) => this.loading = false
    });
  }

  setFilter(val: string): void {
    this.activeFilter = val;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filtered = this.activeFilter === 'TODOS'
      ? [...this.pedidos]
      : this.pedidos.filter(p => p.estado === this.activeFilter);
  }

  getCount(val: string): number {
    return val === 'TODOS' ? this.pedidos.length : this.pedidos.filter(p => p.estado === val).length;
  }

  toggle(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  badgeClass(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'badge-warning', 'EN_PREPARACION': 'badge-warning',
      'EN_CAMINO': 'badge-gold', 'ENTREGADO': 'badge-success', 'CANCELADO': 'badge-danger'
    };
    return 'badge ' + (map[estado] ?? 'badge-gold');
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'Pendiente', 'EN_PREPARACION': 'En preparación',
      'EN_CAMINO': 'En camino', 'ENTREGADO': 'Entregado', 'CANCELADO': 'Cancelado'
    };
    return map[estado] ?? estado;
  }

  // Timeline helpers
  private stateIndex(estado: string): number {
    return this.timelineSteps.findIndex(s => s.key === estado);
  }

  isStepDone(estado: string, stepIdx: number): boolean {
    return stepIdx < this.stateIndex(estado);
  }

  isStepCurrent(estado: string, stepIdx: number): boolean {
    return stepIdx === this.stateIndex(estado);
  }

  timelinePercent(estado: string): string {
    const idx = this.stateIndex(estado);
    if (idx <= 0) return '0%';
    return ((idx / (this.timelineSteps.length - 1)) * 100) + '%';
  }

  // Extract payment method from observations "[Pago en Efectivo] ..."
  getMetodoPago(p: PedidoResponse): string | null {
    if (!p.observaciones) return null;
    const match = p.observaciones.match(/^\[(.+?)\]/);
    return match ? match[1] : null;
  }

  // Get observations without payment tag
  getObservaciones(p: PedidoResponse): string | null {
    if (!p.observaciones) return null;
    const clean = p.observaciones.replace(/^\[.+?\]\s*/, '').trim();
    return clean || null;
  }
}
