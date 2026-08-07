import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PlatilloService } from '../../../core/services/platillo.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ToastService } from '../../../core/services/toast.service';
import { Platillo, Categoria, Page } from '../../../core/models/models';

@Component({
  selector: 'app-admin-platillos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 style="margin-bottom:0.25rem">Gestión de <span class="text-accent">Platillos</span></h1>
          <p class="text-muted">{{ totalElements }} platillos en total</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">+ Nuevo Platillo</button>
      </div>

      <!-- Filtros -->
      <div class="filter-bar">
        <button class="filter-chip" [class.active]="filter === 'TODOS'" (click)="setFilter('TODOS')">
          📋 Todos <span class="chip-count">{{ countAll }}</span>
        </button>
        <button class="filter-chip" [class.active]="filter === 'ACTIVOS'" (click)="setFilter('ACTIVOS')">
          ✅ En stock <span class="chip-count">{{ countActivos }}</span>
        </button>
        <button class="filter-chip" [class.active]="filter === 'AGOTADOS'" (click)="setFilter('AGOTADOS')">
          ⛔ Agotados <span class="chip-count">{{ countAgotados }}</span>
        </button>
        <button class="filter-chip" [class.active]="filter === 'ELIMINADOS'" (click)="setFilter('ELIMINADOS')">
          🗑 Eliminados <span class="chip-count">{{ countEliminados }}</span>
        </button>
      </div>

      <!-- Table -->
      <div class="table-wrapper card">
        <table>
          <thead>
            <tr><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>En Stock</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of platillosFiltrados"
                [class.row-inactive]="p.activo === false"
                [class.row-agotado]="p.activo !== false && !p.disponible">
              <td><img [src]="p.imagenUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'" [alt]="p.nombre" style="width:52px;height:40px;object-fit:cover;border-radius:6px" (error)="$any($event.target).src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'"></td>
              <td>
                <b>{{ p.nombre }}</b>
                <span *ngIf="p.activo === false" class="status-badge badge-deleted">Eliminado</span>
                <span *ngIf="p.activo !== false && !p.disponible" class="status-badge badge-agotado">Agotado</span>
              </td>
              <td><span class="badge badge-gold">{{ p.categoria?.nombre }}</span></td>
              <td class="price">S/ {{ p.precio | number:'1.2-2' }}</td>
              <td>
                <label *ngIf="p.activo !== false" class="toggle-switch" (click)="$event.preventDefault(); onToggle(p)">
                  <input type="checkbox" [checked]="p.disponible">
                  <span class="toggle-slider"></span>
                </label>
                <span *ngIf="p.activo === false" class="text-muted" style="font-size:0.8rem">—</span>
              </td>
              <td style="display:flex;gap:0.5rem">
                <ng-container *ngIf="p.activo !== false">
                  <button class="btn btn-ghost btn-sm" (click)="openModal(p)">✏️</button>
                  <button class="btn btn-ghost btn-sm" style="color:#f44336;border-color:#f44336" (click)="deletePlatillo(p)">🗑</button>
                </ng-container>
                <button *ngIf="p.activo === false" class="btn btn-ghost btn-sm btn-restore" (click)="restorePlatillo(p)">♻️ Restaurar</button>
              </td>
            </tr>
            <tr *ngIf="platillosFiltrados.length === 0">
              <td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">No hay platillos en esta categoría</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:1.5rem">
        <button class="btn btn-secondary" [disabled]="page === 0" (click)="prevPage()">Anterior</button>
        <span class="text-muted">Página {{ page + 1 }} de {{ totalPages || 1 }}</span>
        <button class="btn btn-secondary" [disabled]="page >= totalPages - 1" (click)="nextPage()">Siguiente</button>
      </div>

      <!-- MODAL CREAR/EDITAR -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeOnBackdrop($event)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editMode ? 'Editar Platillo' : 'Nuevo Platillo' }}</h3>
            <button class="btn btn-ghost btn-icon" (click)="closeModal()">✕</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="modal-body" style="display:flex;flex-direction:column;gap:1rem">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-input" formControlName="nombre">
              </div>
              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-input" formControlName="descripcion" rows="3"></textarea>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                <div class="form-group">
                  <label class="form-label">Precio S/ *</label>
                  <input type="number" class="form-input" formControlName="precio" min="0" step="0.50">
                </div>
                <div class="form-group">
                  <label class="form-label">Categoría *</label>
                  <select class="form-input" formControlName="categoriaId">
                    <option *ngFor="let c of categorias" [value]="c.id">{{ c.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Imagen (archivo)</label>
                <input type="file" accept="image/*" (change)="onFileChange($event)" class="form-input">
              </div>
              <div class="form-group" *ngIf="!selectedFile">
                <label class="form-label">O URL de imagen</label>
                <input type="text" class="form-input" formControlName="imagenUrl" placeholder="https://...">
              </div>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
                  <input type="checkbox" formControlName="disponible">
                  <span class="form-label" style="margin:0">Disponible (en stock)</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Guardando...' : (editMode ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- CONFIRM DELETE MODAL -->
      <div class="modal-overlay" *ngIf="showConfirm" (click)="cancelDelete()">
        <div class="confirm-box" (click)="$event.stopPropagation()">
          <div class="confirm-icon">🗑</div>
          <h3 style="margin-bottom:0.5rem">Eliminar platillo</h3>
          <p class="text-muted" style="margin-bottom:0.25rem">¿Estás seguro de que deseas eliminar</p>
          <p style="font-weight:700;color:var(--accent-gold);margin-bottom:0.75rem;font-size:1.1rem">"{{ confirmPlatillo?.nombre }}"?</p>
          <p class="text-muted" style="font-size:0.82rem;margin-bottom:1.5rem">Podrás restaurarlo en cualquier momento desde esta misma tabla.</p>
          <div style="display:flex;gap:0.75rem;justify-content:center">
            <button class="btn btn-ghost" (click)="cancelDelete()">Cancelar</button>
            <button class="btn btn-danger" (click)="confirmDeleteAction()">Sí, eliminar</button>
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

    /* --- Toggle switch --- */
    .toggle-switch {
      position: relative; display: inline-block; width: 40px; height: 22px; cursor: pointer;
    }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: #444; border-radius: 22px; transition: 0.25s;
    }
    .toggle-slider::before {
      content: ''; position: absolute; height: 16px; width: 16px;
      left: 3px; bottom: 3px; background: #fff; border-radius: 50%;
      transition: 0.25s;
    }
    .toggle-switch input:checked + .toggle-slider { background: #4caf50; }
    .toggle-switch input:checked + .toggle-slider::before { transform: translateX(18px); }

    /* --- Row states --- */
    .row-inactive td:not(:last-child) { opacity: 0.4; }
    .row-agotado td:not(:last-child):not(:nth-child(5)) { opacity: 0.55; }

    /* --- Status badges --- */
    .status-badge {
      display: inline-block; margin-left: 0.5rem; font-size: 0.7rem;
      padding: 2px 8px; border-radius: 4px; font-weight: 600;
    }
    .badge-deleted { background: rgba(244,67,54,0.15); color: #f44336; }
    .badge-agotado { background: rgba(255,152,0,0.15); color: #ff9800; }

    /* --- Buttons --- */
    .btn-restore { color: #4caf50 !important; border-color: #4caf50 !important; }
    .btn-restore:hover { background: rgba(76,175,80,0.1); }
    .btn-danger {
      background: #D9381E; color: #fff; border: none; padding: 0.6rem 1.5rem;
      border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;
      font-family: inherit; font-size: 0.9rem; transition: background 0.2s;
    }
    .btn-danger:hover { background: #b52d17; }

    /* --- Confirm modal --- */
    .confirm-box {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: var(--shadow-card);
      text-align: center; animation: confirmIn 0.2s ease-out;
    }
    .confirm-icon {
      font-size: 2.5rem; margin-bottom: 1rem;
      animation: confirmShake 0.4s ease-in-out;
    }
    @keyframes confirmIn {
      from { opacity: 0; transform: scale(0.9); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes confirmShake {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-8deg); }
      75% { transform: rotate(8deg); }
    }
  `]
})
export class AdminPlatillosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private platilloSvc = inject(PlatilloService);
  private catSvc = inject(CategoriaService);
  private toast = inject(ToastService);

  platillos: Platillo[] = [];
  platillosFiltrados: Platillo[] = [];
  categorias: Categoria[] = [];

  // Paginación
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  // Filtro
  filter: 'TODOS' | 'ACTIVOS' | 'AGOTADOS' | 'ELIMINADOS' = 'TODOS';
  countAll = 0;
  countActivos = 0;
  countAgotados = 0;
  countEliminados = 0;

  // Modal CRUD
  showModal = false;
  editMode = false;
  editId: number | null = null;
  saving = false;
  selectedFile: File | null = null;

  // Confirm delete
  showConfirm = false;
  confirmPlatillo: Platillo | null = null;

  form = this.fb.group({
    nombre:      ['', Validators.required],
    descripcion: [''],
    precio:      [0, [Validators.required, Validators.min(0.01)]],
    categoriaId: ['', Validators.required],
    imagenUrl:   [''],
    disponible:  [true]
  });

  ngOnInit(): void {
    this.catSvc.getAllAdmin().subscribe((c: Categoria[]) => this.categorias = c);
    this.load();
  }

  load(): void {
    this.platilloSvc.getAdminPage(this.page, this.size).subscribe({
      next: (res: Page<Platillo>) => {
        this.platillos = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.updateCounts();
        this.applyFilter();
      }
    });
  }

  updateCounts(): void {
    this.countAll = this.platillos.length;
    this.countActivos = this.platillos.filter((p: Platillo) => p.activo !== false && p.disponible).length;
    this.countAgotados = this.platillos.filter((p: Platillo) => p.activo !== false && !p.disponible).length;
    this.countEliminados = this.platillos.filter((p: Platillo) => p.activo === false).length;
  }

  setFilter(f: 'TODOS' | 'ACTIVOS' | 'AGOTADOS' | 'ELIMINADOS'): void {
    this.filter = f;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.filter) {
      case 'ACTIVOS':
        this.platillosFiltrados = this.platillos.filter((p: Platillo) => p.activo !== false && p.disponible);
        break;
      case 'AGOTADOS':
        this.platillosFiltrados = this.platillos.filter((p: Platillo) => p.activo !== false && !p.disponible);
        break;
      case 'ELIMINADOS':
        this.platillosFiltrados = this.platillos.filter((p: Platillo) => p.activo === false);
        break;
      default:
        this.platillosFiltrados = [...this.platillos];
    }
  }

  onToggle(p: Platillo): void {
    this.platilloSvc.toggleDisponible(p.id!).subscribe({
      next: (updated: Platillo) => {
        const idx = this.platillos.findIndex((x: Platillo) => x.id === p.id);
        if (idx >= 0) this.platillos[idx] = updated;
        this.updateCounts();
        this.applyFilter();
        this.toast.success(updated.disponible ? `"${p.nombre}" en stock` : `"${p.nombre}" marcado como agotado`);
      },
      error: (err: any) => this.toast.error(err?.error?.mensaje || 'Error al cambiar disponibilidad')
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) { this.page++; this.load(); }
  }

  prevPage(): void {
    if (this.page > 0) { this.page--; this.load(); }
  }

  openModal(p?: Platillo): void {
    this.showModal = true;
    this.selectedFile = null;
    if (p) {
      this.editMode = true; this.editId = p.id!;
      this.form.patchValue({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, categoriaId: String(p.categoria?.id), imagenUrl: p.imagenUrl || '', disponible: p.disponible ?? true });
    } else {
      this.editMode = false; this.editId = null;
      this.form.reset({ disponible: true, precio: 0 });
    }
  }

  closeModal(): void { this.showModal = false; }
  closeOnBackdrop(e: Event): void { this.closeModal(); }
  onFileChange(e: Event): void { this.selectedFile = (e.target as HTMLInputElement).files?.[0] ?? null; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const fd = new FormData();
    const v = this.form.value;
    fd.append('nombre', v.nombre!);
    fd.append('descripcion', v.descripcion || '');
    fd.append('precio', String(v.precio));
    fd.append('categoriaId', String(v.categoriaId));
    fd.append('disponible', String(v.disponible));
    if (this.selectedFile) fd.append('imagen', this.selectedFile);
    else if (v.imagenUrl) fd.append('imagenUrl', v.imagenUrl);

    const obs = this.editMode
      ? this.platilloSvc.update(this.editId!, fd)
      : this.platilloSvc.create(fd);

    obs.subscribe({
      next: (res: any) => { this.saving = false; this.closeModal(); this.load(); this.toast.success(this.editMode ? 'Platillo actualizado' : 'Platillo creado'); },
      error: (err: any) => { this.saving = false; this.toast.error(err?.error?.mensaje || 'Error al guardar'); }
    });
  }

  deletePlatillo(p: Platillo): void {
    this.confirmPlatillo = p;
    this.showConfirm = true;
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.confirmPlatillo = null;
  }

  confirmDeleteAction(): void {
    if (!this.confirmPlatillo) return;
    const nombre = this.confirmPlatillo.nombre;
    this.platilloSvc.delete(this.confirmPlatillo.id!).subscribe({
      next: () => { this.load(); this.toast.success(`"${nombre}" eliminado`); },
      error: (err: any) => this.toast.error(err?.error?.mensaje || 'Error al eliminar')
    });
    this.showConfirm = false;
    this.confirmPlatillo = null;
  }

  restorePlatillo(p: Platillo): void {
    this.platilloSvc.restore(p.id!).subscribe({
      next: (res: any) => { this.load(); this.toast.success(`"${p.nombre}" restaurado correctamente`); },
      error: (err: any) => this.toast.error(err?.error?.mensaje || 'Error al restaurar')
    });
  }
}
