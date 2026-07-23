import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { PlatilloService } from '../../../core/services/platillo.service';
import { PedidoResponse } from '../../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h1 style="margin-bottom:0.5rem">Dashboard <span class="text-accent">Admin</span></h1>
      <p class="text-muted" style="margin-bottom:2.5rem">Panel de control del restaurante Maido</p>

      <!-- Stats cards -->
      <div class="stats-grid">
        <div class="stat-card card card-body">
          <div class="stat-icon">📦</div>
          <div>
            <p class="stat-label text-muted">Total Pedidos</p>
            <p class="stat-value">{{ pedidos.length }}</p>
          </div>
        </div>
        <div class="stat-card card card-body">
          <div class="stat-icon">⏳</div>
          <div>
            <p class="stat-label text-muted">Pendientes</p>
            <p class="stat-value text-accent">{{ pendientes }}</p>
          </div>
        </div>
        <div class="stat-card card card-body">
          <div class="stat-icon">✅</div>
          <div>
            <p class="stat-label text-muted">Entregados</p>
            <p class="stat-value" style="color:#4caf50">{{ entregados }}</p>
          </div>
        </div>
        <div class="stat-card card card-body">
          <div class="stat-icon">💰</div>
          <div>
            <p class="stat-label text-muted">Ingresos Totales</p>
            <p class="stat-value text-gold">S/ {{ ingresos | number:'1.2-2' }}</p>
          </div>
        </div>
      </div>

      <!-- Accesos rápidos -->
      <div class="quick-links">
        <a routerLink="/admin/platillos" class="quick-card card card-body">
          <span class="quick-icon">🍣</span>
          <h3>Gestionar Platillos</h3>
          <p class="text-muted">CRUD del menú Nikkei</p>
        </a>
        <a routerLink="/admin/pedidos" class="quick-card card card-body">
          <span class="quick-icon">📋</span>
          <h3>Gestionar Pedidos</h3>
          <p class="text-muted">Actualizar estados de delivery</p>
        </a>
        <a routerLink="/admin/reportes" class="quick-card card card-body">
          <span class="quick-icon">📊</span>
          <h3>Reportes</h3>
          <p class="text-muted">Ventas por rango de fechas</p>
        </a>
      </div>

      <!-- Últimos pedidos -->
      <div class="recent-section">
        <h2 style="margin-bottom:1.25rem">Últimos Pedidos</h2>
        <div class="table-wrapper card">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pedidos.slice(0,8)">
                <td><b>#{{ p.id }}</b></td>
                <td>{{ p.usuarioNombre }}</td>
                <td class="text-muted">{{ p.fechaPedido | date:'dd/MM/yy HH:mm' }}</td>
                <td><span class="badge" [ngClass]="badgeClass(p.estado)">{{ p.estado }}</span></td>
                <td class="price">S/ {{ p.total | number:'1.2-2' }}</td>
                <td><a routerLink="/admin/pedidos" class="btn btn-ghost btn-sm">Ver →</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .stat-card { display:flex; align-items:center; gap:1rem; }
    .stat-icon { font-size:2rem; }
    .stat-label { font-size:0.8rem; margin-bottom:0.25rem; }
    .stat-value { font-size:1.5rem; font-weight:700; }
    .quick-links { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .quick-card { display:flex; flex-direction:column; gap:0.5rem; cursor:pointer; }
    .quick-card:hover { border-color:var(--accent-red); }
    .quick-icon { font-size:2rem; }
    .recent-section { margin-top:1rem; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  pedidos: PedidoResponse[] = [];
  pendientes = 0; entregados = 0; ingresos = 0;

  private pedidoSvc = inject(PedidoService);

  ngOnInit(): void {
    this.pedidoSvc.getAll().subscribe((p: PedidoResponse[]) => {
      this.pedidos = p;
      this.pendientes = p.filter(x => x.estado === 'PENDIENTE' || x.estado === 'EN_PREPARACION').length;
      this.entregados = p.filter(x => x.estado === 'ENTREGADO').length;
      this.ingresos = p.filter(x => x.estado !== 'CANCELADO').reduce((a,c) => a + c.total, 0);
    });
  }

  badgeClass(e: string): string {
    const m: Record<string,string> = { PENDIENTE:'badge-warning', EN_PREPARACION:'badge-warning', EN_CAMINO:'badge-gold', ENTREGADO:'badge-success', CANCELADO:'badge-danger' };
    return 'badge ' + (m[e] ?? 'badge-gold');
  }
}
