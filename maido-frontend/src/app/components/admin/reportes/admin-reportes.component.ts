import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoResponse, Page, ReporteResumen } from '../../../core/models/models';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 style="margin-bottom:0.25rem">Reportes de <span class="text-accent">Ventas</span></h1>
          <p class="text-muted">Analiza tus ingresos y pedidos por fecha</p>
        </div>
      </div>

      <!-- Filtro Fechas -->
      <div class="filter-card card card-body" style="margin-bottom:2rem">
        <div style="display:flex;gap:0.5rem;margin-bottom:1rem">
          <button class="btn btn-ghost btn-sm" (click)="setRangoRapido('HOY')">Hoy</button>
          <button class="btn btn-ghost btn-sm" (click)="setRangoRapido('SEMANA')">Esta Semana</button>
          <button class="btn btn-ghost btn-sm" (click)="setRangoRapido('MES')">Este Mes</button>
        </div>
        
        <div style="display:flex;gap:1rem;align-items:flex-end;flex-wrap:wrap">
          <div class="form-group" style="flex:1;min-width:200px;margin:0">
            <label class="form-label">Desde</label>
            <input type="date" class="form-input" [(ngModel)]="fechaInicio">
          </div>
          <div class="form-group" style="flex:1;min-width:200px;margin:0">
            <label class="form-label">Hasta</label>
            <input type="date" class="form-input" [(ngModel)]="fechaFin">
          </div>
          <div style="display:flex;gap:0.5rem">
            <button class="btn btn-primary" (click)="buscar()" [disabled]="loading">
              {{ loading ? 'Consultando...' : '🔍 Buscar' }}
            </button>
            <button class="btn" style="background:#dc2626;color:#fff" (click)="exportarPdf()" *ngIf="searched" [disabled]="loadingPdf">
              {{ loadingPdf ? 'Generando...' : '📄 Exportar PDF' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="skeleton-grid" style="margin-bottom:2rem">
        <div class="skeleton-card" *ngFor="let _ of [1,2,3,4]"></div>
      </div>

      <!-- Resultados -->
      <div *ngIf="searched && !loading">
        <div class="stats-grid" *ngIf="resumen">
          
          <div class="stat-card card card-body">
            <div class="stat-icon" style="color:var(--accent-gold)">💰</div>
            <div>
              <p class="stat-label text-muted">Ingresos del Periodo</p>
              <p class="stat-value text-gold">S/ {{ resumen.ingresos | number:'1.2-2' }}</p>
            </div>
          </div>

          <div class="stat-card card card-body">
            <div class="stat-icon" style="color:#60a5fa">📦</div>
            <div>
              <p class="stat-label text-muted">Total Pedidos</p>
              <p class="stat-value">{{ resumen.totalPedidos }}</p>
            </div>
          </div>

          <div class="stat-card card card-body">
            <div class="stat-icon" style="color:#10b981">✅</div>
            <div>
              <p class="stat-label text-muted">Completados</p>
              <p class="stat-value" style="color:#10b981">{{ resumen.entregados }}</p>
            </div>
          </div>

          <div class="stat-card card card-body">
            <div class="stat-icon" style="color:#f44336">❌</div>
            <div>
              <p class="stat-label text-muted">Cancelados</p>
              <p class="stat-value" style="color:#f44336">{{ resumen.cancelados }}</p>
            </div>
          </div>
        </div>

        <h3 style="margin:2rem 0 1rem">Desglose de Pedidos</h3>
        <div class="table-wrapper card" *ngIf="pedidos.length > 0">
          <table>
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pedidos" [class.row-inactive]="p.estado === 'CANCELADO'">
                <td><b>#{{ p.id }}</b></td>
                <td>{{ p.usuarioNombre }}</td>
                <td class="text-muted">{{ p.fechaPedido | date:'dd/MM/yy HH:mm' }}</td>
                <td class="price">S/ {{ p.total | number:'1.2-2' }}</td>
                <td><span class="badge" [ngClass]="badgeClass(p.estado)">{{ p.estado }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="pedidos.length === 0" style="text-align:center;padding:3rem;color:var(--text-muted);background:rgba(255,255,255,0.02);border-radius:8px;border:1px dashed var(--border)">
          No se encontraron ventas en este rango de fechas.
        </div>

        <!-- Paginación -->
        <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:1.5rem" *ngIf="totalPages > 1">
          <button class="btn btn-secondary" [disabled]="page === 0" (click)="prevPage()">Anterior</button>
          <span class="text-muted">Página {{ page + 1 }} de {{ totalPages }}</span>
          <button class="btn btn-secondary" [disabled]="page >= totalPages - 1" (click)="nextPage()">Siguiente</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* --- Layouts --- */
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .stat-card { display:flex; align-items:flex-start; gap:1rem; border-left: 4px solid transparent; transition:transform 0.2s; }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-icon { font-size:2.2rem; line-height:1; }
    .stat-label { font-size:0.8rem; margin-bottom:0.25rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
    .stat-value { font-size:1.6rem; font-weight:800; line-height:1; }

    /* --- Status indicators --- */
    .badge-warning { background: rgba(255,152,0,0.15); color: #ff9800; border: 1px solid rgba(255,152,0,0.3); }
    .badge-gold { background: rgba(224,169,109,0.15); color: var(--accent-gold); border: 1px solid rgba(224,169,109,0.3); }
    .badge-success { background: rgba(76,175,80,0.15); color: #4caf50; border: 1px solid rgba(76,175,80,0.3); }
    .badge-danger { background: rgba(244,67,54,0.15); color: #f44336; border: 1px solid rgba(244,67,54,0.3); }
    
    .row-inactive td { opacity: 0.5; }

    /* --- Skeleton Loaders --- */
    .skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1.25rem; }
    .skeleton-card { height: 90px; background: rgba(255,255,255,0.05); border-radius: var(--radius-lg); animation: pulse 1.5s infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class AdminReportesComponent implements OnInit {
  fechaInicio = '';
  fechaFin = '';
  
  pedidos: PedidoResponse[] = [];
  resumen: ReporteResumen | null = null;
  
  searched = false;
  loading = false;
  loadingPdf = false;
  
  page = 0;
  size = 10;
  totalPages = 0;

  private pedidoSvc = inject(PedidoService);
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.setRangoRapido('HOY');
  }

  setRangoRapido(rango: 'HOY' | 'SEMANA' | 'MES'): void {
    const hoy = new Date();
    
    if (rango === 'HOY') {
      this.fechaInicio = this.formatDate(hoy);
      this.fechaFin = this.formatDate(hoy);
    } else if (rango === 'SEMANA') {
      const primeroSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 1));
      this.fechaInicio = this.formatDate(primeroSemana);
      this.fechaFin = this.formatDate(new Date());
    } else if (rango === 'MES') {
      const primeroMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaInicio = this.formatDate(primeroMes);
      this.fechaFin = this.formatDate(new Date());
    }
  }

  formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  buscar(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.toast.error('Debe seleccionar un rango de fechas');
      return;
    }
    this.page = 0;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.searched = true;
    
    const inicioIso = new Date(this.fechaInicio + 'T00:00:00').toISOString();
    const finIso = new Date(this.fechaFin + 'T23:59:59').toISOString();

    // 1. Cargar Resumen (Backend DB Aggregation)
    this.http.get<ReporteResumen>(`http://localhost:8080/api/v1/reportes/resumen?inicio=${inicioIso}&fin=${finIso}`)
      .subscribe({
        next: (r) => this.resumen = r,
        error: () => this.toast.error('Error al cargar el resumen')
      });

    // 2. Cargar Tabla (Paginada)
    this.pedidoSvc.getPage(this.page, this.size, 'TODOS', inicioIso, finIso).subscribe({
      next: (res) => {
        this.pedidos = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar la tabla de pedidos');
      }
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadData();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadData();
    }
  }

  exportarPdf(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    this.loadingPdf = true;
    
    const inicioIso = new Date(this.fechaInicio + 'T00:00:00').toISOString();
    const finIso = new Date(this.fechaFin + 'T23:59:59').toISOString();
    const url = `http://localhost:8080/api/v1/reportes/exportar-pdf?inicio=${inicioIso}&fin=${finIso}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.loadingPdf = false;
        const _url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = _url;
        a.download = `Reporte_${this.fechaInicio}_${this.fechaFin}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(_url);
        this.toast.success('Reporte exportado correctamente');
      },
      error: () => {
        this.loadingPdf = false;
        this.toast.error('Error al generar el PDF de JasperReports');
      }
    });
  }

  badgeClass(e: string): string {
    const m: Record<string,string> = { PENDIENTE:'badge-warning', EN_PREPARACION:'badge-warning', EN_CAMINO:'badge-gold', ENTREGADO:'badge-success', CANCELADO:'badge-danger' };
    return m[e] ?? 'badge-gold';
  }
}
