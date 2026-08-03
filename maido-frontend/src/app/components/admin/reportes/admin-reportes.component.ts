import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoResponse } from '../../../core/models/models';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 style="margin-bottom:0.5rem">Reportes de <span class="text-accent">Ventas</span></h1>
      <p class="text-muted" style="margin-bottom:2rem">Filtra pedidos por rango de fechas</p>

      <!-- Filtro fechas -->
      <div class="filter-card card card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:1rem;align-items:end;flex-wrap:wrap">
          <div class="form-group">
            <label class="form-label">Fecha Inicio</label>
            <input type="date" class="form-input" [(ngModel)]="fechaInicio">
          </div>
          <div class="form-group">
            <label class="form-label">Fecha Fin</label>
            <input type="date" class="form-input" [(ngModel)]="fechaFin">
          </div>
          <button class="btn btn-primary" (click)="buscar()" [disabled]="loading">
            {{ loading ? '...' : '🔍 Buscar' }}
          </button>
          <button class="btn btn-secondary" style="margin-left:0.5rem" (click)="exportarPdf()" [disabled]="!searched || loadingPdf">
            {{ loadingPdf ? '...' : '📄 PDF' }}
          </button>
        </div>
      </div>

      <!-- Resultados -->
      <div *ngIf="searched">
        <div class="report-stats">
          <div class="rstat card card-body">
            <p class="text-muted" style="font-size:0.8rem">Pedidos</p>
            <p style="font-size:1.75rem;font-weight:700">{{ pedidos.length }}</p>
          </div>
          <div class="rstat card card-body">
            <p class="text-muted" style="font-size:0.8rem">Ingresos</p>
            <p style="font-size:1.75rem;font-weight:700" class="text-gold">S/ {{ ingresos | number:'1.2-2' }}</p>
          </div>
          <div class="rstat card card-body">
            <p class="text-muted" style="font-size:0.8rem">Entregados</p>
            <p style="font-size:1.75rem;font-weight:700;color:#4caf50">{{ entregados }}</p>
          </div>
          <div class="rstat card card-body">
            <p class="text-muted" style="font-size:0.8rem">Cancelados</p>
            <p style="font-size:1.75rem;font-weight:700;color:#f44336">{{ cancelados }}</p>
          </div>
        </div>

        <div class="table-wrapper card" *ngIf="pedidos.length>0">
          <table>
            <thead><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th>Items</th><th>Total</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of pedidos">
                <td><b>#{{ p.id }}</b></td>
                <td>{{ p.usuarioNombre }}</td>
                <td class="text-muted">{{ p.fechaPedido | date:'dd/MM/yy HH:mm' }}</td>
                <td><span class="badge" [ngClass]="badge(p.estado)">{{ p.estado }}</span></td>
                <td class="text-muted">{{ p.detalles.length }} items</td>
                <td class="price">S/ {{ p.total | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="pedidos.length===0" style="text-align:center;padding:3rem;color:var(--text-muted)">
          No se encontraron pedidos en ese rango de fechas.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-card { margin-bottom:2rem; }
    .report-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .rstat { text-align:center; }
  `]
})
export class AdminReportesComponent {
  fechaInicio = '';
  fechaFin = '';
  pedidos: PedidoResponse[] = [];
  searched = false;
  loading = false;
  ingresos = 0; entregados = 0; cancelados = 0;

  loadingPdf = false;

  private pedidoSvc = inject(PedidoService);
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  buscar(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    this.loading = true;
    const inicio = new Date(this.fechaInicio).toISOString();
    const fin = new Date(this.fechaFin + 'T23:59:59').toISOString();
    this.pedidoSvc.getAll({ inicio, fin }).subscribe({
      next: (p: PedidoResponse[]) => {
        this.pedidos = p; this.searched = true; this.loading = false;
        this.ingresos = p.filter(x => x.estado !== 'CANCELADO').reduce((a,c) => a + c.total, 0);
        this.entregados = p.filter(x => x.estado === 'ENTREGADO').length;
        this.cancelados = p.filter(x => x.estado === 'CANCELADO').length;
      },
      error: (err: any) => this.loading = false
    });
  }

  exportarPdf(): void {
    if (!this.fechaInicio || !this.fechaFin) return;
    this.loadingPdf = true;
    const inicio = new Date(this.fechaInicio).toISOString();
    const fin = new Date(this.fechaFin + 'T23:59:59').toISOString();
    const url = `http://localhost:8080/api/v1/reportes/exportar-pdf?inicio=${inicio}&fin=${fin}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.loadingPdf = false;
        const _url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = _url;
        a.download = 'reporte_ventas.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(_url);
        this.toast.success('Reporte descargado correctamente');
      },
      error: (err) => {
        this.loadingPdf = false;
        this.toast.error('Error al generar el PDF');
      }
    });
  }

  badge(e: string): string {
    const m: Record<string,string> = { PENDIENTE:'badge-warning', EN_PREPARACION:'badge-warning', EN_CAMINO:'badge-gold', ENTREGADO:'badge-success', CANCELADO:'badge-danger' };
    return 'badge ' + (m[e] ?? 'badge-gold');
  }
}
