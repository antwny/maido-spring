import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled">
      <div class="container nav-inner">
        <!-- Logo -->
        <a routerLink="/" class="nav-logo">
          <span class="logo-jp display-font">間道</span>
          <span class="logo-text">MAIDO</span>
        </a>

        <!-- Links públicos -->
        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Inicio</a></li>
          <li><a routerLink="/catalogo" routerLinkActive="active">Menú</a></li>
        </ul>

        <!-- Acciones -->
        <div class="nav-actions">
          <!-- Carrito -->
          <button class="cart-btn" routerLink="/carrito" title="Carrito">
            🛒
            <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </button>

          <!-- Usuario no logueado -->
          <ng-container *ngIf="!user">
            <a routerLink="/login" class="btn btn-ghost btn-sm">Iniciar sesión</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Registrarse</a>
          </ng-container>

          <!-- Usuario logueado -->
          <ng-container *ngIf="user">
            <div class="user-menu" (click)="toggleMenu()" [class.open]="menuOpen">
              <span class="user-avatar">{{ user.nombre.charAt(0) }}</span>
              <span class="user-name">{{ user.nombre }}</span>
              <span>▾</span>
              <div class="dropdown" *ngIf="menuOpen">
                <a routerLink="/mis-pedidos" (click)="menuOpen=false">📋 Mis Pedidos</a>
                <a *ngIf="isAdmin" routerLink="/admin/dashboard" (click)="menuOpen=false">⚙️ Admin</a>
                <hr class="divider" style="margin:0.5rem 0">
                <button (click)="logout()">🚪 Cerrar sesión</button>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 900;
      padding: 0.9rem 0;
      transition: all 0.3s ease;
      border-bottom: 1px solid transparent;
    }
    .navbar.scrolled {
      background: rgba(15,15,17,0.95);
      backdrop-filter: blur(12px);
      border-color: var(--border);
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .nav-inner { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
    .nav-logo { display:flex; align-items:center; gap:0.5rem; }
    .logo-jp { font-size:1.6rem; color:var(--accent-gold); line-height:1; }
    .logo-text { font-size:1.1rem; font-weight:800; letter-spacing:0.15em; }
    .nav-links { display:flex; gap:2rem; list-style:none; }
    .nav-links a { color:var(--text-muted); font-size:0.9rem; font-weight:500; transition:color 0.2s; }
    .nav-links a:hover, .nav-links a.active { color:var(--text-primary); }
    .nav-actions { display:flex; align-items:center; gap:0.75rem; }
    .cart-btn {
      background:rgba(255,255,255,0.06); border:1px solid var(--border);
      border-radius:var(--radius-sm); padding:0.5rem 0.8rem;
      color:var(--text-primary); cursor:pointer; font-size:1rem;
      position:relative; transition:var(--transition);
    }
    .cart-btn:hover { background:rgba(217,56,30,0.15); border-color:var(--accent-red); }
    .cart-badge {
      position:absolute; top:-6px; right:-6px;
      background:var(--accent-red); color:#fff;
      border-radius:50%; width:18px; height:18px;
      font-size:0.7rem; font-weight:700;
      display:flex; align-items:center; justify-content:center;
    }
    .user-menu { position:relative; display:flex; align-items:center; gap:0.5rem; cursor:pointer; }
    .user-avatar {
      width:34px; height:34px; border-radius:50%;
      background:var(--accent-red); color:#fff;
      display:flex; align-items:center; justify-content:center;
      font-weight:700; font-size:0.9rem;
    }
    .user-name { font-size:0.9rem; font-weight:500; }
    .dropdown {
      position:absolute; top:calc(100% + 0.5rem); right:0; z-index:1000;
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:var(--radius-md); padding:0.5rem;
      min-width:180px; box-shadow:var(--shadow-card);
      animation:scaleIn 0.15s ease;
    }
    .dropdown a, .dropdown button {
      display:flex; align-items:center; gap:0.5rem;
      padding:0.6rem 0.75rem; border-radius:var(--radius-sm);
      color:var(--text-primary); font-size:0.875rem;
      transition:var(--transition); background:none; border:none;
      width:100%; cursor:pointer; font-family:inherit;
    }
    .dropdown a:hover, .dropdown button:hover { background:rgba(255,255,255,0.06); }
  `]
})
export class NavbarComponent implements OnInit {
  scrolled = false;
  menuOpen = false;
  cartCount = 0;
  user: any = null;
  isAdmin = false;

  private authState = inject(AuthStateService);
  private cart = inject(CartService);
  private router = inject(Router);

  ngOnInit(): void {
    this.authState.user$.subscribe((u: any) => {
      this.user = u;
      this.isAdmin = u?.rol === 'ROLE_ADMIN';
    });
    this.cart.items$.subscribe((items: any[]) => {
      this.cartCount = items.reduce((a: number, i: any) => a + i.cantidad, 0);
    });
    window.addEventListener('scroll', () => {
      this.scrolled = window.scrollY > 40;
    });
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.user-menu')) {
        this.menuOpen = false;
      }
    });
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }

  logout(): void {
    this.authState.logout();
    this.menuOpen = false;
    this.router.navigate(['/']);
  }
}
