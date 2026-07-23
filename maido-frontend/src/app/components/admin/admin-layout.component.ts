import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span class="logo-jp display-font" style="font-size:1.6rem;color:var(--accent-gold)">間道</span>
          <span class="logo-text" style="font-size:0.9rem;font-weight:800;letter-spacing:0.15em;margin-left:0.4rem">ADMIN</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/admin/platillos" routerLinkActive="active">
            <span class="icon">🍣</span> Platillos
          </a>
          <a routerLink="/admin/pedidos" routerLinkActive="active">
            <span class="icon">📋</span> Pedidos
          </a>
          <a routerLink="/admin/reportes" routerLinkActive="active">
            <span class="icon">📈</span> Reportes
          </a>
          <hr class="divider">
          <a routerLink="/" style="color:var(--text-dim)">
            <span class="icon">🏠</span> Ver Sitio
          </a>
          <button class="sidebar-logout" (click)="logout()">
            <span class="icon">🚪</span> Cerrar Sesión
          </button>
        </nav>
        <div class="sidebar-user">
          <div class="user-avatar-sm">{{ userInitial }}</div>
          <div>
            <p style="font-size:0.85rem;font-weight:600">{{ userName }}</p>
            <p class="text-muted" style="font-size:0.75rem">Administrador</p>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .sidebar-user {
      display:flex; align-items:center; gap:0.75rem;
      padding:1.25rem 1.5rem;
      border-top:1px solid var(--border);
      margin-top:auto;
    }
    .user-avatar-sm {
      width:36px; height:36px; border-radius:50%;
      background:var(--accent-red); color:#fff;
      display:flex; align-items:center; justify-content:center;
      font-weight:700; font-size:0.9rem; flex-shrink:0;
    }
    .sidebar-logout {
      display:flex; align-items:center; gap:0.75rem;
      padding:0.7rem 0.9rem; border-radius:var(--radius-sm);
      color:var(--text-dim); font-size:0.9rem; font-weight:500;
      transition:var(--transition); background:none; border:none;
      width:100%; cursor:pointer; font-family:inherit;
      margin-bottom:0.25rem;
    }
    .sidebar-logout:hover { background:rgba(211,47,47,0.1); color:#f44336; }
  `]
})
export class AdminLayoutComponent {
  private authState = inject(AuthStateService);
  private router = inject(Router);

  userName = '';
  userInitial = '';

  constructor() {
    const u = this.authState.currentUser;
    if (u) { this.userName = u.nombre; this.userInitial = u.nombre.charAt(0); }
  }

  logout(): void {
    this.authState.logout();
    this.router.navigate(['/login']);
  }
}
