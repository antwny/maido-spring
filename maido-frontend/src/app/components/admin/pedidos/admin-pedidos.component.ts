import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { PedidoResponse, Page } from '../../../core/models/models';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 style="margin-bottom:0.25rem">Gestión de <span class="text-accent">Pedidos</span></h1>
          <p class="text-muted">Administra el flujo y estado de las órdenes</p>
        </div>
      </div>

      <!-- Filtros (Chips) -->
      <div class="filter-bar" *ngIf="counts">
        <button class="filter-chip" [class.active]="filter === 'TODOS'" (click)="setFilter('TODOS')">
          📋 Todos <span class="chip-count">{{ counts['TODOS'] || 0 }}</span>
        </button>
        <button class="filter-chip" [class.active]="filter === 'PENDIENTE'" (click)="setFilter('PENDIENTE')">
          🔔 Pendientes <span class="chip-count">{{ counts['PENDIENTE'] || 0 }}</span>
        </button>
        <button class="filter-chip" [class.active]="filter === 'EN_PREPARACION'" (click)="setFilter('EN_PREPARACION')">
          🍳 En Preparación <span class="chip-count">{{ counts['EN_PREPARACION'] || 0 }}</span>
        </button>
        <button class="filter-chip" [class.active]="filter === 'EN_CAMINO'" (click)="setFilter('EN_CAMINO')">
          🛵 En Camino <span class="chip-count">{{ counts['EN_CAMINO'] || 0 }}</span>
        </button>
        <button class="filter-chip" [class.active]="filter === 'ENTREGADO'" (click)="setFilter('ENTREGADO')">
          ✅ Entregados <span class="chip-count">{{ counts['ENTREGADO'] || 0 }}</span>
        </button>
        <button class="filter-chip" [class.active]="filter === 'CANCELADO'" (click)="setFilter('CANCELADO')">
          ❌ Cancelados <span class="chip-count">{{ counts['CANCELADO'] || 0 }}</span>
        </button>
      </div>

      <div *ngIf="loading" class="spinner" style="margin:4rem auto"></div>

      <div class="table-wrapper card" *ngIf="!loading">
        <table>
          <thead>
            <tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of pedidos" [class.row-inactive]="p.estado === 'ENTREGADO' || p.estado === 'CANCELADO'">
              <td><b>#{{ p.id }}</b></td>
              <td>
                <div style="font-weight:600">{{ p.usuarioNombre }}</div>
                <div class="text-muted" style="font-size:0.75rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.direccionEntrega }}</div>
              </td>
              <td class="text-muted" style="font-size:0.85rem">{{ p.fechaPedido | date:'dd/MM/yy HH:mm' }}</td>
              <td class="price">S/ {{ p.total | number:'1.2-2' }}</td>
              <td><span class="badge" [ngClass]="badgeClass(p.estado)">{{ p.estado }}</span></td>
              <td>
                <div style="display:flex;gap:0.5rem;align-items:center">
                  <!-- Botón Ver Detalles -->
                  <button class="btn btn-ghost btn-sm" (click)="openDetails(p)">👁️ Ver</button>
                  
                  <!-- Acciones de Flujo -->
                  <ng-container *ngIf="p.estado === 'PENDIENTE'">
                    <button class="btn btn-primary btn-sm" (click)="cambiarEstado(p, 'EN_PREPARACION')">Aceptar (Cocinar)</button>
                    <button class="btn btn-ghost btn-sm" style="color:#f44336;border-color:#f44336" (click)="cambiarEstado(p, 'CANCELADO')">Cancelar</button>
                  </ng-container>
                  
                  <ng-container *ngIf="p.estado === 'EN_PREPARACION'">
                    <button class="btn btn-primary btn-sm" style="background:#f59e0b;color:#1a1a1a" (click)="cambiarEstado(p, 'EN_CAMINO')">🛵 Enviar Moto</button>
                  </ng-container>
                  
                  <ng-container *ngIf="p.estado === 'EN_CAMINO'">
                    <button class="btn btn-primary btn-sm" style="background:#10b981;color:#fff" (click)="cambiarEstado(p, 'ENTREGADO')">✅ Entregado</button>
                  </ng-container>
                </div>
              </td>
            </tr>
            <tr *ngIf="pedidos.length === 0">
              <td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">No hay pedidos en este estado</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:1.5rem" *ngIf="!loading && totalPages > 0">
        <button class="btn btn-secondary" [disabled]="page === 0" (click)="prevPage()">Anterior</button>
        <span class="text-muted">Página {{ page + 1 }} de {{ totalPages }}</span>
        <button class="btn btn-secondary" [disabled]="page >= totalPages - 1" (click)="nextPage()">Siguiente</button>
      </div>

      <!-- MODAL DETALLES DEL PEDIDO -->
      <div class="modal-overlay" *ngIf="selectedPedido" (click)="closeDetails()">
        <div class="modal-box" (click)="$event.stopPropagation()" style="max-width:500px">
          <div class="modal-header">
            <h3>Pedido #{{ selectedPedido.id }}</h3>
            <button class="btn btn-ghost btn-icon" (click)="closeDetails()">✕</button>
          </div>
          <div class="modal-body" style="display:flex;flex-direction:column;gap:1.5rem">
            
            <div class="info-grid">
              <div><span class="text-muted">Cliente:</span><br><b>{{ selectedPedido.usuarioNombre }}</b></div>
              <div><span class="text-muted">Fecha:</span><br><b>{{ selectedPedido.fechaPedido | date:'dd/MM/yy HH:mm' }}</b></div>
              <div><span class="text-muted">Estado:</span><br><span class="badge" [ngClass]="badgeClass(selectedPedido.estado)">{{ selectedPedido.estado }}</span></div>
            </div>

            <div class="detail-section">
              <h4 style="margin-bottom:0.5rem;font-size:0.9rem;color:var(--accent-gold)">Dirección de Entrega</h4>
              <p style="font-size:0.85rem;margin:0">{{ selectedPedido.direccionEntrega }}</p>
            </div>

            <div class="detail-section" *ngIf="selectedPedido.observaciones">
              <h4 style="margin-bottom:0.5rem;font-size:0.9rem;color:var(--accent-gold)">Observaciones</h4>
              <p style="font-size:0.85rem;margin:0;background:rgba(224,169,109,0.1);padding:0.75rem;border-radius:6px;border-left:3px solid var(--accent-gold)">{{ selectedPedido.observaciones }}</p>
            </div>

            <div class="detail-section">
              <h4 style="margin-bottom:0.75rem;font-size:0.9rem;color:var(--accent-gold)">Platillos</h4>
              <div class="items-list">
                <div class="item-row" *ngFor="let item of selectedPedido.detalles">
                  <div class="item-qty">{{ item.cantidad }}x</div>
                  <div class="item-name">{{ item.platilloNombre }}</div>
                  <div class="item-price">S/ {{ item.subtotal | number:'1.2-2' }}</div>
                </div>
              </div>
              <div class="total-row">
                <span>Total</span>
                <span class="price">S/ {{ selectedPedido.total | number:'1.2-2' }}</span>
              </div>
            </div>

          </div>
          <div class="modal-footer" style="justify-content:center">
            <button class="btn btn-primary" (click)="closeDetails()" style="width:100%">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* --- Filter bar --- */
    .filter-bar {
      display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;
    }
    .filter-chip {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 1rem; border-radius: 999px;
      border: 1px solid var(--border); background: transparent;
      color: var(--text-muted); cursor: pointer; font-family: inherit;
      font-size: 0.85rem; transition: all 0.2s;
    }
    .filter-chip:hover { border-color: var(--accent-gold); color: var(--text-primary); }
    .filter-chip.active {
      background: rgba(224,169,109,0.12); border-color: var(--accent-gold);
      color: var(--accent-gold); font-weight: 600;
    }
    .chip-count {
      background: rgba(255,255,255,0.08); padding: 1px 7px;
      border-radius: 999px; font-size: 0.75rem; font-weight: 600;
    }
    .filter-chip.active .chip-count {
      background: rgba(224,169,109,0.2);
    }

    /* --- Status badges --- */
    .badge-warning { background: rgba(255,152,0,0.15); color: #ff9800; border: 1px solid rgba(255,152,0,0.3); }
    .badge-gold { background: rgba(224,169,109,0.15); color: var(--accent-gold); border: 1px solid rgba(224,169,109,0.3); }
    .badge-success { background: rgba(76,175,80,0.15); color: #4caf50; border: 1px solid rgba(76,175,80,0.3); }
    .badge-danger { background: rgba(244,67,54,0.15); color: #f44336; border: 1px solid rgba(244,67,54,0.3); }

    .row-inactive td:not(:last-child) { opacity: 0.5; }

    /* --- Modal Details --- */
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-size: 0.85rem; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); }
    .items-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
    .item-row { display: flex; align-items: center; font-size: 0.9rem; padding-bottom: 0.75rem; border-bottom: 1px dashed var(--border); }
    .item-qty { font-weight: 700; color: var(--accent-gold); width: 30px; }
    .item-name { flex: 1; }
    .item-price { font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; padding-top: 0.5rem; }
  `]
})
export class AdminPedidosComponent implements OnInit {
  private pedidoSvc = inject(PedidoService);
  private toast = inject(ToastService);

  pedidos: PedidoResponse[] = [];
  loading = true;
  
  // Paginación
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  // Filtros
  filter = 'TODOS';
  counts: Record<string, number> = {};

  // Modal
  selectedPedido: PedidoResponse | null = null;

  ngOnInit(): void {
    this.loadCounts();
    this.load();
  }

  loadCounts(): void {
    this.pedidoSvc.getCounts().subscribe(c => this.counts = c);
  }

  load(): void {
    this.loading = true;
    this.pedidoSvc.getPage(this.page, this.size, this.filter).subscribe({
      next: (res: Page<PedidoResponse>) => { 
        this.pedidos = res.content; 
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.loading = false; 
      },
      error: (err: any) => this.loading = false
    });
  }

  setFilter(f: string): void {
    if (this.filter === f) return;
    this.filter = f;
    this.page = 0;
    this.load();
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.load();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }

  openDetails(p: PedidoResponse): void {
    this.selectedPedido = p;
  }

  closeDetails(): void {
    this.selectedPedido = null;
  }

  cambiarEstado(p: PedidoResponse, nuevoEstado: string): void {
    this.pedidoSvc.cambiarEstado(p.id, nuevoEstado).subscribe({
      next: (updated: PedidoResponse) => {
        this.toast.success(`Pedido #${p.id} → ${nuevoEstado}`);
        this.loadCounts();
        this.load(); // Reload to refresh list according to current filter
      },
      error: (err: any) => this.toast.error(err?.error?.mensaje || 'Error al cambiar estado')
    });
  }

  badgeClass(e: string): string {
    const m: Record<string,string> = { PENDIENTE:'badge-warning', EN_PREPARACION:'badge-warning', EN_CAMINO:'badge-gold', ENTREGADO:'badge-success', CANCELADO:'badge-danger' };
    return m[e] ?? 'badge-gold';
  }
}
