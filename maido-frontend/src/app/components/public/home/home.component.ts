import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlatilloService } from '../../../core/services/platillo.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Platillo, Categoria } from '../../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="container hero-content">
        <p class="hero-eyebrow display-font">間道 — Restaurante Nikkei</p>
        <h1>Alta Cocina<br><span class="text-accent">Peruano-Japonesa</span></h1>
        <p class="hero-desc">
          Fusión única entre la gastronomía peruana y japonesa.<br>
          Ingredientes frescos, sabores únicos, experiencia Nikkei.
        </p>
        <div class="hero-actions">
          <a routerLink="/catalogo" class="btn btn-primary btn-lg">Ver Menú Completo</a>
          <a href="#destacados" class="btn btn-secondary btn-lg">Platillos Destacados</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">15+</span><span class="stat-label">Años de excelencia</span></div>
          <div class="stat-sep"></div>
          <div class="stat"><span class="stat-num">50+</span><span class="stat-label">Platillos únicos</span></div>
          <div class="stat-sep"></div>
          <div class="stat"><span class="stat-num">#1</span><span class="stat-label">Restaurante Nikkei</span></div>
        </div>
      </div>
      <div class="hero-scroll">
        <span>↓</span>
      </div>
    </section>

    <!-- CATEGORÍAS -->
    <section class="section-sm" style="background:var(--bg-secondary)">
      <div class="container">
        <div class="cats-scroll">
          <button class="cat-chip" [class.active]="!selectedCat" (click)="filterCat(null)">Todos</button>
          <button *ngFor="let c of categorias" class="cat-chip" [class.active]="selectedCat?.id===c.id" (click)="filterCat(c)">
            {{ c.nombre }}
          </button>
        </div>
      </div>
    </section>

    <!-- PLATILLOS DESTACADOS -->
    <section id="destacados" class="section">
      <div class="container">
        <div class="section-header">
          <h2>Nuestro <span>Menú</span></h2>
          <div class="accent-line"></div>
          <p class="section-subtitle">Los mejores platillos de la fusión Nikkei, preparados con ingredientes frescos del día.</p>
        </div>

        <div *ngIf="loading" class="spinner"></div>

        <div *ngIf="!loading" class="grid-3">
          <div *ngFor="let p of platillosFiltrados" class="card platillo-card">
            <div class="card-img-wrap">
              <img [src]="p.imagenUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'"
                   [alt]="p.nombre" class="card-img" loading="lazy" (error)="$any($event.target).src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'">
              <span class="card-cat badge badge-gold">{{ p.categoria?.nombre }}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ p.nombre }}</h3>
              <p class="card-desc text-muted">{{ p.descripcion }}</p>
              <div class="card-footer">
                <span class="price">S/ {{ p.precio | number:'1.2-2' }}</span>
                <button class="btn btn-primary btn-sm" (click)="addToCart(p)">+ Agregar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="see-more" *ngIf="!loading">
          <a routerLink="/catalogo" class="btn btn-secondary">Ver menú completo →</a>
        </div>
      </div>
    </section>

    <!-- BANNER -->
    <section class="banner-section">
      <div class="container banner-inner">
        <div>
          <h2 class="display-font">Delivery en Lima</h2>
          <p class="text-muted">Recibe los sabores de Maido en tu hogar. Pedidos disponibles todos los días.</p>
        </div>
        <a routerLink="/catalogo" class="btn btn-primary btn-lg">Pedir Ahora</a>
      </div>
    </section>
  `,
  styles: [`
    /* HERO */
    .hero { position:relative; min-height:100vh; display:flex; align-items:center; overflow:hidden; }
    .hero-bg {
      position:absolute; inset:0;
      background: linear-gradient(135deg, #0F0F11 0%, #1a0a08 50%, #0F0F11 100%);
    }
    .hero-bg::after {
      content:''; position:absolute; inset:0;
      background: radial-gradient(ellipse 60% 60% at 70% 50%, rgba(217,56,30,0.12) 0%, transparent 70%);
    }
    .hero-content { position:relative; z-index:1; padding-top:5rem; }
    .hero-eyebrow { color:var(--accent-gold); font-size:1rem; letter-spacing:0.15em; margin-bottom:1rem; }
    .hero h1 { margin-bottom:1.5rem; font-size:clamp(3rem,7vw,5rem); }
    .hero-desc { color:var(--text-muted); font-size:1.1rem; line-height:1.7; max-width:540px; margin-bottom:2rem; }
    .hero-actions { display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:3rem; }
    .hero-stats { display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; }
    .stat { display:flex; flex-direction:column; }
    .stat-num { font-size:1.75rem; font-weight:800; color:var(--accent-gold); }
    .stat-label { font-size:0.8rem; color:var(--text-muted); }
    .stat-sep { width:1px; height:40px; background:var(--border); }
    .hero-scroll { position:absolute; bottom:2rem; left:50%; transform:translateX(-50%); color:var(--text-muted); font-size:1.2rem; animation:bounce 2s infinite; }
    @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }

    /* CATS */
    .cats-scroll { display:flex; gap:0.75rem; overflow-x:auto; padding-bottom:0.5rem; }
    .cats-scroll::-webkit-scrollbar { display:none; }
    .cat-chip {
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:99px; padding:0.45rem 1.2rem;
      color:var(--text-muted); font-size:0.875rem; font-weight:500;
      cursor:pointer; white-space:nowrap; transition:var(--transition);
      font-family:inherit;
    }
    .cat-chip.active, .cat-chip:hover { background:var(--accent-red); border-color:var(--accent-red); color:#fff; }

    /* CARD */
    .card-img-wrap { position:relative; }
    .card-cat { position:absolute; top:0.75rem; left:0.75rem; }
    .card-title { font-size:1rem; font-weight:700; margin-bottom:0.4rem; }
    .card-desc { font-size:0.85rem; line-height:1.5; margin-bottom:1rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .card-footer { display:flex; align-items:center; justify-content:space-between; }
    .see-more { text-align:center; margin-top:3rem; }

    /* BANNER */
    .banner-section { background:linear-gradient(90deg, rgba(217,56,30,0.15) 0%, rgba(224,169,109,0.1) 100%); border-top:1px solid rgba(217,56,30,0.2); border-bottom:1px solid rgba(217,56,30,0.2); padding:3.5rem 0; }
    .banner-inner { display:flex; align-items:center; justify-content:space-between; gap:2rem; flex-wrap:wrap; }
    .banner-inner h2 { font-size:2rem; margin-bottom:0.5rem; }
  `]
})
export class HomeComponent implements OnInit {
  platillos: Platillo[] = [];
  platillosFiltrados: Platillo[] = [];
  categorias: Categoria[] = [];
  selectedCat: Categoria | null = null;
  loading = true;

  private platilloSvc = inject(PlatilloService);
  private catSvc = inject(CategoriaService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.catSvc.getAll().subscribe((c: Categoria[]) => this.categorias = c);
    this.platilloSvc.getAll().subscribe({
      next: (p: Platillo[]) => { this.platillos = p.slice(0,9); this.platillosFiltrados = this.platillos; this.loading = false; },
      error: (err: any) => this.loading = false
    });
  }

  filterCat(cat: Categoria | null): void {
    this.selectedCat = cat;
    if (!cat) { this.platillosFiltrados = this.platillos; return; }
    this.platillosFiltrados = this.platillos.filter(p => p.categoria?.id === cat.id);
  }

  addToCart(p: Platillo): void {
    this.cart.addItem(p);
    this.toast.success(`✅ ${p.nombre} agregado al carrito`);
  }
}
