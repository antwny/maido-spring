import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PlatilloService } from '../../../core/services/platillo.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ToastService } from '../../../core/services/toast.service';
import { Platillo, Categoria } from '../../../core/models/models';

@Component({
  selector: 'app-admin-platillos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem">
        <div>
          <h1 style="margin-bottom:0.25rem">Gestión de <span class="text-accent">Platillos</span></h1>
          <p class="text-muted">{{ platillos.length }} platillos en el menú</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">+ Nuevo Platillo</button>
      </div>

      <!-- Table -->
      <div class="table-wrapper card">
        <table>
          <thead>
            <tr><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Disponible</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of platillos">
              <td><img [src]="p.imagenUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'" [alt]="p.nombre" style="width:52px;height:40px;object-fit:cover;border-radius:6px" (error)="$any($event.target).src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'"></td>
              <td><b>{{ p.nombre }}</b></td>
              <td><span class="badge badge-gold">{{ p.categoria?.nombre }}</span></td>
              <td class="price">S/ {{ p.precio | number:'1.2-2' }}</td>
              <td>
                <span class="badge" [class.badge-success]="p.disponible" [class.badge-danger]="!p.disponible">
                  {{ p.disponible ? 'Sí' : 'No' }}
                </span>
              </td>
              <td style="display:flex;gap:0.5rem">
                <button class="btn btn-ghost btn-sm" (click)="openModal(p)">✏️</button>
                <button class="btn btn-ghost btn-sm" style="color:#f44336;border-color:#f44336" (click)="deletePlatillo(p)">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL -->
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
                  <span class="form-label" style="margin:0">Disponible</span>
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
    </div>
  `
})
export class AdminPlatillosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private platilloSvc = inject(PlatilloService);
  private catSvc = inject(CategoriaService);
  private toast = inject(ToastService);

  platillos: Platillo[] = [];
  categorias: Categoria[] = [];
  showModal = false;
  editMode = false;
  editId: number | null = null;
  saving = false;
  selectedFile: File | null = null;

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
    this.platilloSvc.getAll().subscribe((p: Platillo[]) => this.platillos = p);
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
      error: (err: any) => { this.saving = false; this.toast.error('Error al guardar'); }
    });
  }

  deletePlatillo(p: Platillo): void {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    this.platilloSvc.delete(p.id!).subscribe({
      next: (res: any) => { this.load(); this.toast.success('Platillo eliminado'); },
      error: (err: any) => this.toast.error('Error al eliminar')
    });
  }
}
