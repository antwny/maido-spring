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
              <span class="chevron" [class.rotated]="menuOpen">▾</span>
              
              <!-- Menú Desplegable Premium -->
              <div class="dropdown-glass" *ngIf="menuOpen">
                <div class="dropdown-header">
                  <div class="dh-avatar">{{ user.nombre.charAt(0) }}</div>
                  <div class="dh-info">
                    <span class="dh-name">{{ user.nombre }} {{ user.apellido }}</span>
                    <span class="dh-email">{{ user.email }}</span>
                  </div>
                </div>
                <hr class="divider" style="margin:0.5rem 0">
                <a routerLink="/mis-pedidos" (click)="menuOpen=false" class="dropdown-item">
                  <span class="di-icon">📋</span> Mis Pedidos
                </a>
                <a routerLink="/perfil" (click)="menuOpen=false" class="dropdown-item">
                  <span class="di-icon">👤</span> Mi Perfil
                </a>
                <a *ngIf="isAdmin" routerLink="/admin/dashboard" (click)="menuOpen=false" class="dropdown-item">
                  <span class="di-icon">⚙️</span> Panel Admin
                </a>
                <hr class="divider" style="margin:0.5rem 0">
                <button (click)="logout()" class="dropdown-item logout-btn">
                  <span class="di-icon">🚪</span> Cerrar sesión
                </button>
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
    .user-menu { position:relative; display:flex; align-items:center; gap:0.5rem; cursor:pointer; padding:0.2rem 0.5rem; border-radius:100px; transition:all 0.2s; }
    .user-menu:hover { background:rgba(255,255,255,0.05); }
    .chevron { font-size:0.8rem; transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .chevron.rotated { transform:rotate(180deg); color:var(--accent-gold); }
    
    .dropdown-glass {
      position:absolute; top:calc(100% + 0.8rem); right:0; z-index:1000;
      background:rgba(20,20,24,0.85); backdrop-filter:blur(16px);
      border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-lg);
      padding:0.5rem; min-width:240px; 
      box-shadow:0 15px 35px rgba(0,0,0,0.5), 0 0 0 1px rgba(224,169,109,0.1);
      animation:slideIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      transform-origin:top right;
    }
    
    .dropdown-header { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; }
    .dh-avatar { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, var(--accent-red), #992215); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; color:#fff; }
    .dh-info { display:flex; flex-direction:column; overflow:hidden; }
    .dh-name { font-weight:700; font-size:0.95rem; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
    .dh-email { font-size:0.75rem; color:var(--text-muted); white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
    
    .dropdown-item {
      display:flex; align-items:center; gap:0.75rem;
      padding:0.65rem 0.75rem; border-radius:var(--radius-sm);
      color:var(--text-primary); font-size:0.9rem; font-weight:500;
      transition:all 0.2s; background:none; border:none;
      width:100%; cursor:pointer; font-family:inherit; text-align:left;
    }
    .di-icon { font-size:1.1rem; opacity:0.8; transition:transform 0.2s; }
    .dropdown-item:hover { background:rgba(255,255,255,0.08); transform:translateX(2px); }
    .dropdown-item:hover .di-icon { transform:scale(1.1); }
    
    .logout-btn { color:#f87171; margin-top:0.25rem; }
    .logout-btn:hover { background:rgba(248,113,113,0.1); color:#fca5a5; }
    
    @keyframes slideIn { from { opacity:0; transform:scale(0.95) translateY(-10px); } to { opacity:1; transform:scale(1) translateY(0); } }
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
