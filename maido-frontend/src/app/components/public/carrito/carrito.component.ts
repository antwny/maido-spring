import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { CartItem } from '../../../core/models/models';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="carrito-page">
      <div class="container">
        <h1 style="margin-bottom:0.5rem">🛒 Mi <span class="text-accent">Carrito</span></h1>
        <p class="text-muted" style="margin-bottom:2.5rem">{{ items.length }} {{ items.length===1?'platillo':'platillos' }} seleccionados</p>

        <div *ngIf="items.length===0" class="empty-cart">
          <p style="font-size:4rem">🍱</p>
          <h3>Tu carrito está vacío</h3>
          <p class="text-muted">Explora nuestro menú y agrega platillos</p>
          <a routerLink="/catalogo" class="btn btn-primary" style="margin-top:1.5rem">Ver Menú</a>
        </div>

        <div *ngIf="items.length>0" class="cart-layout">
          <!-- Items -->
          <div class="cart-items">
            <div *ngFor="let item of items" class="cart-item card">
              <img [src]="item.platillo.imagenUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'"
                   [alt]="item.platillo.nombre" class="item-img" (error)="$any($event.target).src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'">
              <div class="item-info">
                <h4>{{ item.platillo.nombre }}</h4>
                <p class="text-muted" style="font-size:0.85rem">{{ item.platillo.categoria?.nombre }}</p>
                <p class="price">S/ {{ item.platillo.precio | number:'1.2-2' }}</p>
              </div>
              <div class="item-qty">
                <button class="qty-btn" (click)="decrease(item)">−</button>
                <span class="qty-num">{{ item.cantidad }}</span>
                <button class="qty-btn" (click)="increase(item)">+</button>
              </div>
              <div class="item-total">
                <p class="price">S/ {{ (item.platillo.precio * item.cantidad) | number:'1.2-2' }}</p>
                <button class="btn btn-ghost btn-sm" (click)="remove(item)" style="color:#f44336;border-color:#f44336">🗑</button>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="cart-summary card card-body">
            <h3 style="margin-bottom:1.5rem">Resumen del Pedido</h3>
            <div class="summary-row" *ngFor="let item of items">
              <span class="text-muted">{{ item.platillo.nombre }} x{{ item.cantidad }}</span>
              <span>S/ {{ (item.platillo.precio * item.cantidad) | number:'1.2-2' }}</span>
            </div>
            <hr class="divider divider-gold">
            <div class="summary-row summary-total">
              <span>Total</span>
              <span class="price" style="font-size:1.3rem">S/ {{ total | number:'1.2-2' }}</span>
            </div>
            <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1.5rem" (click)="proceedToCheckout()">
              Proceder al Checkout →
            </button>
            <button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:0.75rem" (click)="clearCart()">
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carrito-page { padding-top:6rem; padding-bottom:4rem; min-height:100vh; }
    .empty-cart { text-align:center; padding:4rem 0; }
    .cart-layout { display:grid; grid-template-columns:1fr 340px; gap:2rem; align-items:start; }
    .cart-items { display:flex; flex-direction:column; gap:1rem; }
    .cart-item { display:flex; align-items:center; gap:1rem; padding:1rem; border-radius:var(--radius-md); }
    .item-img { width:80px; height:80px; object-fit:cover; border-radius:var(--radius-sm); flex-shrink:0; }
    .item-info { flex:1; }
    .item-info h4 { font-size:0.95rem; margin-bottom:0.2rem; }
    .item-qty { display:flex; align-items:center; gap:0.5rem; }
    .qty-btn { width:32px; height:32px; border-radius:50%; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-primary); cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:var(--transition); }
    .qty-btn:hover { border-color:var(--accent-red); color:var(--accent-red); }
    .qty-num { min-width:24px; text-align:center; font-weight:600; }
    .item-total { display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem; }
    .summary-row { display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:0.9rem; }
    .summary-total { font-weight:700; font-size:1rem; margin-bottom:0; }
    @media(max-width:768px) { .cart-layout { grid-template-columns:1fr; } }
  `]
})
export class CarritoComponent implements OnInit {
  items: CartItem[] = [];
  total = 0;

  private cart = inject(CartService);
  private authState = inject(AuthStateService);
  private router = inject(Router);

  ngOnInit(): void {
    this.cart.items$.subscribe((i: CartItem[]) => {
      this.items = i;
      this.total = i.reduce((a, c) => a + c.platillo.precio * c.cantidad, 0);
    });
  }

  increase(item: CartItem): void { this.cart.updateQuantity(item.platillo.id!, item.cantidad + 1); }
  decrease(item: CartItem): void { this.cart.updateQuantity(item.platillo.id!, item.cantidad - 1); }
  remove(item: CartItem): void { this.cart.removeItem(item.platillo.id!); }
  clearCart(): void { this.cart.clear(); }

  proceedToCheckout(): void {
    if (!this.authState.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    } else {
      this.router.navigate(['/checkout']);
    }
  }
}
