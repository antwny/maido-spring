import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/guards';

export const routes: Routes = [
  // Públicas
  { path: '', loadComponent: () => import('./components/public/home/home.component').then(m => m.HomeComponent) },
  { path: 'catalogo', loadComponent: () => import('./components/public/catalogo/catalogo.component').then(m => m.CatalogoComponent) },
  { path: 'carrito', loadComponent: () => import('./components/public/carrito/carrito.component').then(m => m.CarritoComponent) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./components/public/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'mis-pedidos', canActivate: [authGuard], loadComponent: () => import('./components/public/mis-pedidos/mis-pedidos.component').then(m => m.MisPedidosComponent) },
  { path: 'perfil', canActivate: [authGuard], loadComponent: () => import('./components/public/perfil/perfil.component').then(m => m.PerfilComponent) },

  // Auth (solo invitados)
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./components/public/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./components/public/register/register.component').then(m => m.RegisterComponent) },

  // Admin
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'platillos', loadComponent: () => import('./components/admin/platillos/admin-platillos.component').then(m => m.AdminPlatillosComponent) },
      { path: 'pedidos', loadComponent: () => import('./components/admin/pedidos/admin-pedidos.component').then(m => m.AdminPedidosComponent) },
      { path: 'reportes', loadComponent: () => import('./components/admin/reportes/admin-reportes.component').then(m => m.AdminReportesComponent) },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
