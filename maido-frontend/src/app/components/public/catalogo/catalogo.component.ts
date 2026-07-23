import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatilloService } from '../../../core/services/platillo.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Platillo, Categoria } from '../../../core/models/models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="catalogo-page">
      <!-- Header -->
      <div class="cat-header">
        <div class="container">
          <h1>Nuestro <span class="text-accent">Menú</span></h1>
          <p class="text-muted">Descubre toda la experiencia Nikkei de Maido</p>
        </div>
      </div>

      <div class="container" style="padding-top:2rem; padding-bottom:4rem">
        <!-- Filtros -->
        <div class="filters-bar">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" class="form-input search-input" placeholder="Buscar platillo..."
                   [(ngModel)]="searchTerm" (ngModelChange)="onSearch()">
          </div>
          <div class="cats-scroll">
            <button class="cat-chip" [class.active]="!selectedCat" (click)="filterCat(null)">Todos</button>
            <button *ngFor="let c of categorias" class="cat-chip"
                    [class.active]="selectedCat?.id===c.id" (click)="filterCat(c)">
              {{ c.nombre }}
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="spinner"></div>

        <!-- Sin resultados -->
        <div *ngIf="!loading && platillosFiltrados.length===0" class="empty-state">
          <p style="font-size:3rem">🍱</p>
          <h3>No se encontraron platillos</h3>
          <p class="text-muted">Intenta con otra búsqueda o categoría</p>
        </div>

        <!-- Grid -->
        <div *ngIf="!loading && platillosFiltrados.length>0" class="grid-4">
          <div *ngFor="let p of platillosFiltrados" class="card platillo-card">
            <div class="card-img-wrap">
              <img [src]="p.imagenUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'"
                   [alt]="p.nombre" class="card-img" loading="lazy" (error)="$any($event.target).src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'">
              <span class="card-cat badge badge-gold">{{ p.categoria?.nombre }}</span>
              <span *ngIf="!p.disponible" class="badge badge-danger" style="position:absolute;top:0.75rem;right:0.75rem">No disponible</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ p.nombre }}</h3>
              <p class="card-desc text-muted">{{ p.descripcion }}</p>
              <div class="card-footer">
                <span class="price">S/ {{ p.precio | number:'1.2-2' }}</span>
                <button class="btn btn-primary btn-sm"
                        [disabled]="!p.disponible"
                        (click)="addToCart(p)">
                  {{ p.disponible ? '+ Agregar' : 'Agotado' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalogo-page { padding-top:5rem; }
    .cat-header { background:linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary)); padding:3rem 0 2rem; text-align:center; }
    .cat-header h1 { margin-bottom:0.5rem; }
    .filters-bar { display:flex; gap:1rem; align-items:center; flex-wrap:wrap; margin-bottom:2rem; }
    .search-wrap { position:relative; flex:1; min-width:220px; }
    .search-icon { position:absolute; left:0.85rem; top:50%; transform:translateY(-50%); font-size:0.9rem; }
    .search-input { padding-left:2.5rem; }
    .cats-scroll { display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.25rem; flex-wrap:wrap; }
    .cat-chip {
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:99px; padding:0.4rem 1rem;
      color:var(--text-muted); font-size:0.85rem; font-weight:500;
      cursor:pointer; white-space:nowrap; transition:var(--transition); font-family:inherit;
    }
    .cat-chip.active,.cat-chip:hover { background:var(--accent-red); border-color:var(--accent-red); color:#fff; }
    .card-img-wrap { position:relative; }
    .card-cat { position:absolute; top:0.75rem; left:0.75rem; }
    .card-title { font-size:0.95rem; font-weight:700; margin-bottom:0.35rem; }
    .card-desc { font-size:0.82rem; line-height:1.5; margin-bottom:0.85rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .card-footer { display:flex; align-items:center; justify-content:space-between; }
    .empty-state { text-align:center; padding:4rem 0; }
    .empty-state h3 { margin:1rem 0 0.5rem; }
  `]
})
export class CatalogoComponent implements OnInit {
  platillos: Platillo[] = [];
  platillosFiltrados: Platillo[] = [];
  categorias: Categoria[] = [];
  selectedCat: Categoria | null = null;
  searchTerm = '';
  loading = true;

  private platilloSvc = inject(PlatilloService);
  private catSvc = inject(CategoriaService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.catSvc.getAll().subscribe((c: Categoria[]) => this.categorias = c);
    this.platilloSvc.getAll().subscribe({
      next: (p: Platillo[]) => { this.platillos = p; this.platillosFiltrados = p; this.loading = false; },
      error: (err: any) => this.loading = false
    });
  }

  filterCat(cat: Categoria | null): void {
    this.selectedCat = cat;
    this.searchTerm = '';
    this.applyFilter();
  }

  onSearch(): void {
    this.selectedCat = null;
    this.applyFilter();
  }

  private applyFilter(): void {
    let res = [...this.platillos];
    if (this.selectedCat) res = res.filter(p => p.categoria?.id === this.selectedCat!.id);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      res = res.filter(p => p.nombre.toLowerCase().includes(t) || p.descripcion?.toLowerCase().includes(t));
    }
    this.platillosFiltrados = res;
  }

  addToCart(p: Platillo): void {
    this.cart.addItem(p);
    this.toast.success(`${p.nombre} agregado al carrito`);
  }
}
