import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { PedidoResponse } from '../../../core/models/models';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

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

        <!-- Skeleton Loader -->
        <div *ngIf="loading" class="pedidos-list">
          <div class="skeleton-card" *ngFor="let _ of [1,2,3]"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filtered.length === 0" class="empty-state card">
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

        <!-- Lista de Pedidos -->
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
                  <div style="display:flex;align-items:center;gap:0.75rem">
                    <div class="item-img" [style.backgroundImage]="'url(' + (d.platilloImagenUrl || 'assets/placeholder.jpg') + ')'"></div>
                    <div style="display:flex;flex-direction:column">
                      <span style="font-weight:600;font-size:0.9rem">{{ d.platilloNombre }}</span>
                      <span class="text-muted" style="font-size:0.8rem">Cant: {{ d.cantidad }}</span>
                    </div>
                  </div>
                  <span style="font-weight:700">S/ {{ d.subtotal | number:'1.2-2' }}</span>
                </div>
              </div>
              
              <div class="pedido-footer">
                <div class="footer-details">
                  <div class="footer-row" *ngIf="getMetodoPago(p)">
                    <span>💳 Pago: <b>{{ getMetodoPago(p) }}</b></span>
                  </div>
                  <div class="footer-row">
                    <span>📍 Entrega: {{ p.direccionEntrega }}</span>
                  </div>
                  <div class="footer-row obs" *ngIf="getObservaciones(p)">
                    <span>📝 "{{ getObservaciones(p) }}"</span>
                  </div>
                </div>
                
                <div class="footer-actions">
                  <button class="btn btn-primary" (click)="repetirPedido(p)">
                    <span>🔁 Repetir Pedido</span>
                  </button>
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
      padding:0.5rem 1.25rem; border-radius:100px;
      background:rgba(255,255,255,0.02); border:1px solid var(--border);
      color:var(--text-muted); font-size:0.9rem; font-weight:500; cursor:pointer;
      transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .chip:hover { border-color:rgba(224,169,109,0.4); color:var(--text-primary); transform:translateY(-1px); }
    .chip.active { background:rgba(224,169,109,0.12); border-color:var(--accent-gold); color:var(--accent-gold); font-weight:600; box-shadow:0 4px 12px rgba(224,169,109,0.15); }
    .chip-count {
      background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:100px;
      font-size:0.75rem; min-width:20px; text-align:center;
    }
    .chip.active .chip-count { background:rgba(224,169,109,0.2); }

    /* Skeleton Loader */
    .skeleton-card { height:120px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); margin-bottom:1rem; animation:pulse 1.5s infinite; }
    
    /* Empty State */
    .empty-state { text-align:center; padding:4rem 2rem; background:rgba(255,255,255,0.01); border-style:dashed; }
    .empty-icon { font-size:4.5rem; margin-bottom:1rem; opacity:0.8; }

    /* Lista */
    .pedidos-list { display:flex; flex-direction:column; gap:1rem; max-width:850px; }

    /* Card */
    .pedido-card { overflow:hidden; transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border:1px solid var(--border); background:var(--bg-card); }
    .pedido-card:hover { border-color:rgba(255,255,255,0.15); }
    .pedido-card.expanded { border-color:var(--accent-gold); box-shadow:0 10px 25px -5px rgba(0,0,0,0.5); }

    /* Header */
    .pedido-header {
      display:flex; align-items:center; padding:1.25rem 1.5rem;
      cursor:pointer; user-select:none; gap:1rem; transition:background 0.2s;
    }
    .pedido-header:hover { background:rgba(255,255,255,0.02); }
    .header-left { flex:1; }
    .pedido-num { font-size:1.1rem; font-weight:800; margin-bottom:0.25rem; letter-spacing:0.05em; }
    .pedido-date { font-size:0.85rem; color:var(--text-muted); }
    .header-right { display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem; }
    .pedido-total { font-size:1.1rem; font-weight:800; color:var(--text-primary); }
    
    .expand-icon { font-size:1.2rem; color:var(--text-muted); transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-left:0.5rem; }
    .expand-icon.rotated { transform:rotate(180deg); color:var(--accent-gold); }

    /* Timeline */
    .timeline-bar {
      display:flex; justify-content:space-between; align-items:flex-start;
      padding:0.5rem 2rem 1.5rem; position:relative;
    }
    .tl-step { display:flex; flex-direction:column; align-items:center; z-index:1; flex:1; }
    .tl-dot {
      width:16px; height:16px; border-radius:50%;
      background:var(--bg-secondary); border:3px solid var(--border);
      margin-bottom:0.5rem; transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tl-step.done .tl-dot { background:var(--accent-gold); border-color:var(--accent-gold); }
    .tl-step.current .tl-dot { background:var(--accent-gold); border-color:#fff; box-shadow:0 0 15px rgba(224,169,109,0.8); animation:pulseGlow 2s infinite; }
    .tl-label { font-size:0.75rem; color:var(--text-muted); text-align:center; font-weight:500; transition:color 0.3s; }
    .tl-step.done .tl-label, .tl-step.current .tl-label { color:var(--accent-gold); font-weight:700; }
    .tl-track {
      position:absolute; top:calc(0.5rem + 7px); left:calc(2rem + 16px); right:calc(2rem + 16px);
      height:4px; background:var(--border); border-radius:2px; z-index:0;
    }
    .tl-fill {
      height:100%; background:var(--accent-gold); border-radius:2px;
      transition:width 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes pulseGlow { 0%,100% { box-shadow:0 0 10px rgba(224,169,109,0.5); transform:scale(1); } 50% { box-shadow:0 0 20px rgba(224,169,109,0.9); transform:scale(1.2); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    
    .timeline-cancelled { padding:0.5rem 1.5rem 1.5rem; font-size:0.9rem; color:#ef4444; font-weight:600; }

    /* Body expandible */
    .pedido-body { animation:slideDown 0.3s ease forwards; background:rgba(0,0,0,0.1); border-top:1px solid var(--border); }
    @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
    
    .pedido-items { padding:1rem 1.5rem; }
    .detalle-row {
      display:flex; justify-content:space-between; align-items:center; padding:0.75rem 0;
      border-bottom:1px solid rgba(255,255,255,0.05);
    }
    .detalle-row:last-child { border:none; }
    
    .item-img { width: 45px; height: 45px; border-radius: 50%; background-size: cover; background-position: center; border:2px solid rgba(255,255,255,0.1); }
    
    .pedido-footer { padding:1.25rem 1.5rem; background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-top:1px solid var(--border); }
    .footer-details { display:flex; flex-direction:column; gap:0.4rem; flex:1; min-width:250px; }
    .footer-row { font-size:0.85rem; color:var(--text-muted); }
    .footer-row b { color:var(--text-primary); }
    .footer-row.obs { font-style:italic; opacity:0.8; margin-top:0.25rem; }

    @media(max-width:600px) {
      .pedido-header { flex-wrap:wrap; }
      .tl-label { font-size:0.65rem; }
      .filter-chips { gap:0.4rem; }
      .chip { padding:0.4rem 0.8rem; font-size:0.8rem; }
      .pedido-footer { flex-direction:column; align-items:flex-start; }
      .footer-actions { width:100%; }
      .footer-actions .btn { width:100%; justify-content:center; }
    }
  `]
})
export class MisPedidosComponent implements OnInit {
  private pedidoSvc = inject(PedidoService);
  private authState = inject(AuthStateService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);

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
    this.loadData();
  }
  
  loadData() {
    const id = this.authState.currentUser?.id;
    if (!id) return;
    this.loading = true;
    this.pedidoSvc.getAll({ usuarioId: id }).subscribe({
      next: (p: PedidoResponse[]) => { 
        this.pedidos = p; 
        this.applyFilter(); 
        this.loading = false; 
      },
      error: () => this.loading = false
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

  // Extract payment method from observations
  getMetodoPago(p: PedidoResponse): string | null {
    if (!p.observaciones) return null;
    const match = p.observaciones.match(/\[Pago: (.+?)\]/);
    if (match) return match[1];
    
    // Fallback for older orders format
    const oldMatch = p.observaciones.match(/^\[(.+?)\]/);
    if (oldMatch && !oldMatch[1].startsWith('Tel:')) return oldMatch[1];
    
    return null;
  }

  // Get observations without tags
  getObservaciones(p: PedidoResponse): string | null {
    if (!p.observaciones) return null;
    let clean = p.observaciones;
    // Remove all [Tag: value] patterns from start
    while (clean.match(/^\[.+?\]\s*/)) {
      clean = clean.replace(/^\[.+?\]\s*/, '');
    }
    return clean.trim() || null;
  }
  
  // Re-order functionality
  repetirPedido(p: PedidoResponse): void {
    // We add all items to cart
    p.detalles.forEach(d => {
      // Create a fake platillo object to add to cart
      const platillo = {
        id: d.platilloId,
        nombre: d.platilloNombre,
        precio: d.precioUnitario,
        descripcion: '',
        imagenUrl: d.platilloImagenUrl || 'assets/placeholder.jpg',
        disponible: true,
        activo: true,
        categoria: { id: 1, nombre: 'Platillo' } // Dummy category
      };
      
      // Add multiple times to match quantity
      for (let i = 0; i < d.cantidad; i++) {
        this.cart.addItem(platillo as any);
      }
    });
    
    this.toast.success('¡Platillos agregados al carrito!');
    this.router.navigate(['/carrito']);
  }
}
