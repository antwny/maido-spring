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
        <p class="hero-eyebrow display-font fade-up delay-1">間道 — Restaurante Nikkei</p>
        <h1 class="fade-up delay-2">Alta Cocina<br><span class="text-accent">Peruano-Japonesa</span></h1>
        <p class="hero-desc fade-up delay-3">
          Fusión única entre la gastronomía peruana y japonesa.<br>
          Ingredientes frescos, sabores únicos, experiencia Nikkei.
        </p>
        <div class="hero-actions fade-up delay-4">
          <a routerLink="/catalogo" class="btn btn-primary btn-lg">Ver Menú Completo</a>
          <a href="#destacados" class="btn btn-secondary btn-lg">Platillos Destacados</a>
        </div>
        <div class="hero-stats fade-up delay-5">
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

        <!-- Skeleton Loaders -->
        <div *ngIf="loading" class="grid-3">
          <div class="skeleton-card" *ngFor="let _ of [1,2,3,4,5,6]">
            <div class="skel-img"></div>
            <div class="skel-body">
              <div class="skel-line title"></div>
              <div class="skel-line"></div>
              <div class="skel-line short"></div>
              <div class="skel-footer">
                <div class="skel-price"></div>
                <div class="skel-btn"></div>
              </div>
            </div>
          </div>
        </div>

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
    /* ANIMACIONES */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }

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
    .hero-eyebrow { color:var(--accent-gold); font-size:1.1rem; letter-spacing:0.2em; margin-bottom:1rem; text-transform:uppercase; font-weight:600; }
    .hero h1 { margin-bottom:1.5rem; font-size:clamp(3rem,7vw,5rem); line-height:1.1; }
    .hero-desc { color:var(--text-muted); font-size:1.15rem; line-height:1.7; max-width:540px; margin-bottom:2.5rem; }
    .hero-actions { display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:3.5rem; }
    .hero-stats { display:flex; align-items:center; gap:2rem; flex-wrap:wrap; }
    .stat { display:flex; flex-direction:column; }
    .stat-num { font-size:2rem; font-weight:800; color:var(--accent-gold); line-height:1; margin-bottom:0.2rem; }
    .stat-label { font-size:0.85rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .stat-sep { width:1px; height:45px; background:rgba(255,255,255,0.1); }
    
    .hero-scroll { position:absolute; bottom:2rem; left:50%; transform:translateX(-50%); color:var(--accent-gold); font-size:1.5rem; animation:bounce 2s infinite; opacity:0.8; }
    @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(10px)} }

    /* CATS */
    .cats-scroll { display:flex; gap:0.75rem; overflow-x:auto; padding-bottom:0.5rem; }
    .cats-scroll::-webkit-scrollbar { display:none; }
    .cat-chip {
      background:var(--bg-card); border:1px solid rgba(255,255,255,0.05);
      border-radius:99px; padding:0.5rem 1.25rem;
      color:var(--text-muted); font-size:0.9rem; font-weight:500;
      cursor:pointer; white-space:nowrap; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family:inherit;
    }
    .cat-chip:hover { background:rgba(255,255,255,0.05); color:#fff; transform:translateY(-2px); }
    .cat-chip.active { background:rgba(224,169,109,0.15); border-color:var(--accent-gold); color:var(--accent-gold); box-shadow:0 4px 12px rgba(224,169,109,0.2); }

    /* CARD CON MICRO-ANIMACIONES */
    .platillo-card { overflow:hidden; transition:all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border:1px solid rgba(255,255,255,0.05); }
    .platillo-card:hover { transform:translateY(-8px); border-color:rgba(224,169,109,0.3); box-shadow:0 15px 30px rgba(0,0,0,0.4); }
    .card-img-wrap { position:relative; overflow:hidden; }
    .card-img { width:100%; height:220px; object-fit:cover; transition:transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .platillo-card:hover .card-img { transform:scale(1.08); }
    .card-cat { position:absolute; top:1rem; left:1rem; z-index:2; box-shadow:0 4px 10px rgba(0,0,0,0.5); backdrop-filter:blur(4px); }
    
    .card-body { padding:1.5rem; }
    .card-title { font-size:1.1rem; font-weight:800; margin-bottom:0.5rem; transition:color 0.3s; }
    .platillo-card:hover .card-title { color:var(--accent-gold); }
    .card-desc { font-size:0.85rem; line-height:1.6; margin-bottom:1.5rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .card-footer { display:flex; align-items:center; justify-content:space-between; }
    .price { font-size:1.2rem; font-weight:800; color:var(--text-primary); }
    .see-more { text-align:center; margin-top:4rem; }

    /* SKELETON LOADERS */
    .skeleton-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; animation:pulse 1.5s infinite; }
    .skel-img { height:220px; background:rgba(255,255,255,0.02); }
    .skel-body { padding:1.5rem; }
    .skel-line { height:12px; background:rgba(255,255,255,0.05); border-radius:4px; margin-bottom:0.75rem; }
    .skel-line.title { height:18px; width:70%; margin-bottom:1rem; }
    .skel-line.short { width:40%; margin-bottom:1.5rem; }
    .skel-footer { display:flex; justify-content:space-between; align-items:center; }
    .skel-price { height:20px; width:60px; background:rgba(255,255,255,0.05); border-radius:4px; }
    .skel-btn { height:32px; width:90px; background:rgba(255,255,255,0.05); border-radius:100px; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

    /* BANNER */
    .banner-section { background:linear-gradient(90deg, rgba(217,56,30,0.15) 0%, rgba(224,169,109,0.1) 100%); border-top:1px solid rgba(217,56,30,0.2); border-bottom:1px solid rgba(217,56,30,0.2); padding:4rem 0; margin-top:2rem; }
    .banner-inner { display:flex; align-items:center; justify-content:space-between; gap:2rem; flex-wrap:wrap; }
    .banner-inner h2 { font-size:2.2rem; margin-bottom:0.75rem; font-weight:800; }
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
      next: (p: Platillo[]) => { 
        this.platillos = p.slice(0,9); 
        this.platillosFiltrados = this.platillos; 
        this.loading = false; 
      },
      error: () => this.loading = false
    });
  }

  filterCat(cat: Categoria | null): void {
    this.selectedCat = cat;
    if (!cat) { 
      this.platillosFiltrados = this.platillos; 
      return; 
    }
    this.platillosFiltrados = this.platillos.filter(p => p.categoria?.id === cat.id);
  }

  addToCart(p: Platillo): void {
    this.cart.addItem(p);
    // Limpiamos el emoji redundante
    this.toast.success(`${p.nombre} agregado al carrito`);
  }
}
