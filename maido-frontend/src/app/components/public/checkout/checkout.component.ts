import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { CartItem } from '../../../core/models/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-page">
      <div class="container">
        <h1 style="margin-bottom:2rem">Confirmar <span class="text-accent">Pedido</span></h1>

        <div *ngIf="success" class="success-box">
          <div style="font-size:4rem;margin-bottom:1rem">🎉</div>
          <h2>¡Pedido Confirmado!</h2>
          <p class="text-muted">Tu pedido #{{ pedidoId }} ha sido recibido. Lo prepararemos con mucho amor.</p>
          <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem">
            <button class="btn btn-primary" (click)="goHome()">Ir al Inicio</button>
            <button class="btn btn-secondary" (click)="goMisPedidos()">Ver mis pedidos</button>
          </div>
        </div>

        <div *ngIf="!success" class="checkout-layout">
          <!-- Formulario -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="checkout-form">
            <div class="card card-body" style="margin-bottom:1.5rem">
              <h3 style="margin-bottom:1.25rem">📍 Datos de Entrega</h3>
              <div class="form-group" style="margin-bottom:1rem">
                <label class="form-label">Nombre completo</label>
                <input type="text" class="form-input" [value]="userName" readonly style="opacity:0.6">
              </div>
              <div class="form-group" style="margin-bottom:1rem">
                <label class="form-label">Dirección de entrega *</label>
                <input type="text" class="form-input" formControlName="direccionEntrega" placeholder="Av. La Mar 700, Miraflores, Lima">
                <span class="form-error" *ngIf="err('direccionEntrega')">La dirección es obligatoria</span>
              </div>
              <div class="form-group">
                <label class="form-label">Observaciones (opcional)</label>
                <textarea class="form-input" formControlName="observaciones" rows="3" placeholder="Sin cebolla, extra salsa, etc."></textarea>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center" [disabled]="loading">
              <span *ngIf="loading" class="btn-spinner"></span>
              {{ loading ? 'Procesando pedido...' : '✅ Confirmar Pedido' }}
            </button>
          </form>

          <!-- Resumen -->
          <div class="checkout-summary">
            <div class="card card-body">
              <h3 style="margin-bottom:1.25rem">Tu Pedido</h3>
              <div *ngFor="let item of items" class="order-line">
                <span>{{ item.platillo.nombre }} <b>x{{ item.cantidad }}</b></span>
                <span class="price">S/ {{ (item.platillo.precio * item.cantidad) | number:'1.2-2' }}</span>
              </div>
              <hr class="divider divider-gold">
              <div class="order-line" style="font-weight:700;font-size:1.05rem">
                <span>Total</span>
                <span class="price" style="font-size:1.2rem">S/ {{ total | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page { padding-top:6rem; padding-bottom:4rem; min-height:100vh; }
    .checkout-layout { display:grid; grid-template-columns:1fr 360px; gap:2rem; align-items:start; }
    .success-box { text-align:center; padding:4rem 2rem; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); max-width:500px; margin:0 auto; }
    .order-line { display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:0.9rem; }
    .btn-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    @media(max-width:768px) { .checkout-layout { grid-template-columns:1fr; } .checkout-summary { order:-1; } }
  `]
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cart = inject(CartService);
  private authState = inject(AuthStateService);
  private pedidoSvc = inject(PedidoService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.group({
    direccionEntrega: ['', Validators.required],
    observaciones: ['']
  });
  items: CartItem[] = [];
  total = 0;
  loading = false;
  success = false;
  pedidoId: number | null = null;
  userName = '';

  ngOnInit(): void {
    this.cart.items$.subscribe((i: CartItem[]) => { this.items = i; this.total = i.reduce((a,c) => a + c.platillo.precio * c.cantidad, 0); });
    const u = this.authState.currentUser;
    if (u) { 
      this.userName = `${u.nombre} ${u.apellido}`; 
      if (u.direccion) {
        this.form.patchValue({ direccionEntrega: u.direccion });
      }
    }
    if (!this.authState.isLoggedIn) { this.router.navigate(['/login']); }
  }

  err(f: string): boolean { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.items.length === 0) { this.toast.error('El carrito está vacío'); return; }
    this.loading = true;
    const user = this.authState.currentUser!;
    const payload = {
      usuarioId: user.id,
      direccionEntrega: this.form.value.direccionEntrega!,
      observaciones: this.form.value.observaciones || undefined,
      detalles: this.items.map(i => ({
        platilloId: i.platillo.id!,
        cantidad: i.cantidad,
        precioUnitario: i.platillo.precio
      }))
    };
    this.pedidoSvc.create(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = true;
        this.pedidoId = res.id;
        this.cart.clear();
        this.toast.success(`Pedido #${res.id} confirmado exitosamente`);
      },
      error: (err: any) => { this.loading = false; this.toast.error('Error al procesar el pedido'); }
    });
  }

  goHome(): void { this.router.navigate(['/']); }
  goMisPedidos(): void { this.router.navigate(['/mis-pedidos']); }
}
