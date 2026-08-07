import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoResponse, DashboardStats, Page } from '../../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h1 style="margin-bottom:0.5rem">Dashboard <span class="text-accent">Admin</span></h1>
      <p class="text-muted" style="margin-bottom:2.5rem">Métricas operativas del día en tiempo real</p>

      <div *ngIf="loadingStats" class="skeleton-grid">
        <div class="skeleton-card" *ngFor="let _ of [1,2,3,4]"></div>
      </div>

      <!-- Stats cards -->
      <div class="stats-grid" *ngIf="!loadingStats && stats">
        
        <div class="stat-card card card-body">
          <div class="stat-icon" style="color:var(--accent-gold)">💰</div>
          <div>
            <p class="stat-label text-muted">Ingresos de Hoy</p>
            <p class="stat-value text-gold">S/ {{ stats.ingresosHoy | number:'1.2-2' }}</p>
            <p style="font-size:0.75rem;margin-top:0.25rem;opacity:0.6">Total histórico: S/ {{ stats.ingresosTotales | number:'1.2-2' }}</p>
          </div>
        </div>

        <div class="stat-card card card-body">
          <div class="stat-icon" style="color:#60a5fa">📦</div>
          <div>
            <p class="stat-label text-muted">Nuevos Pedidos (Hoy)</p>
            <p class="stat-value">{{ stats.pedidosHoy }}</p>
          </div>
        </div>

        <div class="stat-card card card-body">
          <div class="stat-icon" style="color:#f59e0b">⏳</div>
          <div>
            <p class="stat-label text-muted">Pedidos Activos</p>
            <p class="stat-value" style="color:#f59e0b">{{ stats.pedidosActivos }}</p>
            <p style="font-size:0.75rem;margin-top:0.25rem;opacity:0.6">En cocina o en camino</p>
          </div>
        </div>

        <div class="stat-card card card-body" [class.alert-border]="stats.platillosAgotados > 0">
          <div class="stat-icon" style="color:#f44336">⚠️</div>
          <div>
            <p class="stat-label text-muted">Platillos Agotados</p>
            <p class="stat-value" [style.color]="stats.platillosAgotados > 0 ? '#f44336' : '#fff'">{{ stats.platillosAgotados }}</p>
            <a *ngIf="stats.platillosAgotados > 0" routerLink="/admin/platillos" style="font-size:0.75rem;margin-top:0.25rem;color:#f44336;display:block">Ir a reponer stock →</a>
          </div>
        </div>
      </div>

      <!-- Accesos rápidos -->
      <div class="quick-links">
        <a routerLink="/admin/platillos" class="quick-card card card-body">
          <span class="quick-icon">🍣</span>
          <h3>Gestionar Menú</h3>
          <p class="text-muted">CRUD de platillos y control de stock</p>
        </a>
        <a routerLink="/admin/pedidos" class="quick-card card card-body">
          <span class="quick-icon">📋</span>
          <h3>Gestión de Pedidos</h3>
          <p class="text-muted">Flujo de estados y despachos</p>
        </a>
        <a routerLink="/admin/reportes" class="quick-card card card-body">
          <span class="quick-icon">📊</span>
          <h3>Reportes PDF</h3>
          <p class="text-muted">Exportar ventas por rango de fechas</p>
        </a>
      </div>

      <!-- Últimos pedidos -->
      <div class="recent-section">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1.25rem">
          <h2 style="margin:0">Últimos Pedidos</h2>
          <a routerLink="/admin/pedidos" class="text-accent" style="font-size:0.9rem">Ver todos →</a>
        </div>
        
        <div *ngIf="loadingPedidos" class="skeleton-table card">
          <div class="skeleton-row" *ngFor="let _ of [1,2,3,4,5]"></div>
        </div>

        <div class="table-wrapper card" *ngIf="!loadingPedidos">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of ultimosPedidos" [class.urgent-row]="p.estado === 'PENDIENTE'">
                <td><b>#{{ p.id }}</b></td>
                <td>{{ p.usuarioNombre }}</td>
                <td class="text-muted" style="font-size:0.85rem">{{ p.fechaPedido | date:'dd/MM/yy HH:mm' }}</td>
                <td class="price">S/ {{ p.total | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="badgeClass(p.estado)">{{ p.estado }}</span>
                  <span *ngIf="p.estado === 'PENDIENTE'" class="ping"></span>
                </td>
              </tr>
              <tr *ngIf="ultimosPedidos.length === 0">
                <td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted)">No hay pedidos recientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* --- Layouts --- */
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .stat-card { display:flex; align-items:flex-start; gap:1rem; border-left: 4px solid transparent; transition:transform 0.2s; }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-icon { font-size:2.2rem; line-height:1; }
    .stat-label { font-size:0.85rem; margin-bottom:0.25rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
    .stat-value { font-size:1.8rem; font-weight:800; line-height:1; }
    .alert-border { border-left-color: #f44336 !important; }

    .quick-links { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1.25rem; margin-bottom:2.5rem; }
    .quick-card { display:flex; flex-direction:column; gap:0.5rem; cursor:pointer; text-decoration:none; color:inherit; }
    .quick-card h3 { margin:0; font-size:1.1rem; }
    .quick-card:hover { border-color:var(--accent-gold); background:rgba(224,169,109,0.03); }
    .quick-icon { font-size:2rem; margin-bottom:0.25rem; }
    
    .recent-section { margin-top:1rem; }
    
    /* --- Badges --- */
    .badge-warning { background: rgba(255,152,0,0.15); color: #ff9800; border: 1px solid rgba(255,152,0,0.3); }
    .badge-gold { background: rgba(224,169,109,0.15); color: var(--accent-gold); border: 1px solid rgba(224,169,109,0.3); }
    .badge-success { background: rgba(76,175,80,0.15); color: #4caf50; border: 1px solid rgba(76,175,80,0.3); }
    .badge-danger { background: rgba(244,67,54,0.15); color: #f44336; border: 1px solid rgba(244,67,54,0.3); }

    /* --- Status indicators --- */
    .urgent-row { background: rgba(224,169,109,0.05); }
    .ping {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent-gold); margin-left: 8px;
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes ping {
      75%, 100% { transform: scale(2); opacity: 0; }
    }

    /* --- Skeleton Loaders --- */
    .skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .skeleton-card { height: 100px; background: rgba(255,255,255,0.05); border-radius: var(--radius-lg); animation: pulse 1.5s infinite; }
    .skeleton-table { padding: 1rem; display:flex; flex-direction:column; gap:1rem; }
    .skeleton-row { height: 40px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); animation: pulse 1.5s infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private pedidoSvc = inject(PedidoService);

  stats: DashboardStats | null = null;
  ultimosPedidos: PedidoResponse[] = [];
  
  loadingStats = true;
  loadingPedidos = true;

  ngOnInit(): void {
    this.loadStats();
    this.loadUltimosPedidos();
  }

  loadStats(): void {
    this.pedidoSvc.getDashboardStats().subscribe({
      next: (s) => {
        this.stats = s;
        this.loadingStats = false;
      },
      error: () => this.loadingStats = false
    });
  }

  loadUltimosPedidos(): void {
    // Pedimos solo la página 0 con 8 elementos, ordenados por fecha desc
    this.pedidoSvc.getPage(0, 8).subscribe({
      next: (res: Page<PedidoResponse>) => {
        this.ultimosPedidos = res.content;
        this.loadingPedidos = false;
      },
      error: () => this.loadingPedidos = false
    });
  }

  badgeClass(e: string): string {
    const m: Record<string,string> = { PENDIENTE:'badge-warning', EN_PREPARACION:'badge-warning', EN_CAMINO:'badge-gold', ENTREGADO:'badge-success', CANCELADO:'badge-danger' };
    return m[e] ?? 'badge-gold';
  }
}
