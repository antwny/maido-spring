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
      <h1 style="margin-bottom:0.5rem">Gestión de <span class="text-accent">Pedidos</span></h1>
      <p class="text-muted" style="margin-bottom:2rem">Administra y actualiza el estado de los pedidos</p>

      <!-- Filtros -->
      <div class="filters-row">
        <select class="form-input" style="max-width:200px" [(ngModel)]="estadoFilter" (ngModelChange)="applyFilter()">
          <option value="">Todos los estados (esta página)</option>
          <option *ngFor="let e of estados" [value]="e">{{ e }}</option>
        </select>
        <span class="text-muted">{{ totalElements }} pedidos en total</span>
      </div>

      <div *ngIf="loading" class="spinner"></div>

      <div class="table-wrapper card" *ngIf="!loading">
        <table>
          <thead>
            <tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Dirección</th><th>Cambiar Estado</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of pedidosFiltrados">
              <td><b>#{{ p.id }}</b></td>
              <td>{{ p.usuarioNombre }}</td>
              <td class="text-muted" style="font-size:0.85rem">{{ p.fechaPedido | date:'dd/MM/yy HH:mm' }}</td>
              <td><span class="badge" [ngClass]="badgeClass(p.estado)">{{ p.estado }}</span></td>
              <td class="price">S/ {{ p.total | number:'1.2-2' }}</td>
              <td class="text-muted" style="font-size:0.85rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.direccionEntrega }}</td>
              <td>
                <select class="form-input" style="font-size:0.82rem;padding:0.35rem 0.6rem"
                        [value]="p.estado"
                        (change)="cambiarEstado(p, $any($event.target).value)">
                  <option *ngFor="let e of estados" [value]="e">{{ e }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:1.5rem" *ngIf="!loading">
        <button class="btn btn-secondary" [disabled]="page === 0" (click)="prevPage()">Anterior</button>
        <span class="text-muted">Página {{ page + 1 }} de {{ totalPages || 1 }}</span>
        <button class="btn btn-secondary" [disabled]="page >= totalPages - 1" (click)="nextPage()">Siguiente</button>
      </div>
    </div>
  `,
  styles: [`
    .filters-row { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; }
  `]
})
export class AdminPedidosComponent implements OnInit {
  pedidos: PedidoResponse[] = [];
  pedidosFiltrados: PedidoResponse[] = [];
  estadoFilter = '';
  loading = true;
  estados = ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
  
  // Paginación
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  private pedidoSvc = inject(PedidoService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.pedidoSvc.getPage(this.page, this.size).subscribe({
      next: (res: Page<PedidoResponse>) => { 
        this.pedidos = res.content; 
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.applyFilter(); 
        this.loading = false; 
      },
      error: (err: any) => this.loading = false
    });
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

  applyFilter(): void {
    this.pedidosFiltrados = this.estadoFilter
      ? this.pedidos.filter(p => p.estado === this.estadoFilter)
      : [...this.pedidos];
  }

  cambiarEstado(p: PedidoResponse, estado: string): void {
    if (estado === p.estado) return;
    this.pedidoSvc.cambiarEstado(p.id, estado).subscribe({
      next: (updated: PedidoResponse) => {
        const idx = this.pedidos.findIndex(x => x.id === p.id);
        if (idx >= 0) this.pedidos[idx] = updated;
        this.applyFilter();
        this.toast.success(`Pedido #${p.id} → ${estado}`);
      },
      error: (err: any) => this.toast.error(err?.error?.mensaje || 'Error al cambiar estado')
    });
  }

  badgeClass(e: string): string {
    const m: Record<string,string> = { PENDIENTE:'badge-warning', EN_PREPARACION:'badge-warning', EN_CAMINO:'badge-gold', ENTREGADO:'badge-success', CANCELADO:'badge-danger' };
    return 'badge ' + (m[e] ?? 'badge-gold');
  }
}
