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

              <h3 style="margin-top:2rem;margin-bottom:1.25rem">💳 Método de Pago</h3>
              <div class="payment-methods-grid">
                <label class="payment-card" [class.active]="form.get('metodoPago')?.value === 'EFECTIVO'">
                  <input type="radio" formControlName="metodoPago" value="EFECTIVO" style="display:none">
                  <div class="payment-icon">💵</div>
                  <div class="payment-name">Efectivo</div>
                  <div class="payment-desc">Pagas al recibir</div>
                </label>
                <label class="payment-card" [class.active]="form.get('metodoPago')?.value === 'POS'">
                  <input type="radio" formControlName="metodoPago" value="POS" style="display:none">
                  <div class="payment-icon">📟</div>
                  <div class="payment-name">POS</div>
                  <div class="payment-desc">Débito o Crédito</div>
                </label>
                <label class="payment-card" [class.active]="form.get('metodoPago')?.value === 'TARJETA'">
                  <input type="radio" formControlName="metodoPago" value="TARJETA" style="display:none">
                  <div class="payment-icon">💳</div>
                  <div class="payment-name">Tarjeta Web</div>
                  <div class="payment-desc">Pago online seguro</div>
                </label>
              </div>

              <!-- Simulador de Tarjeta -->
              <div class="card-simulation-wrapper" *ngIf="form.get('metodoPago')?.value === 'TARJETA'">
                <div class="card-simulation">
                  <div class="card-sim-header">
                    <span>Datos de la tarjeta</span>
                    <div class="card-brands">
                      <span class="brand visa">VISA</span>
                      <span class="brand mc">MC</span>
                    </div>
                  </div>
                  <div class="form-group" style="margin-bottom:1rem">
                    <input type="text" class="form-input card-input" formControlName="tarjetaNumero" placeholder="0000 0000 0000 0000">
                  </div>
                  <div style="display:flex; gap:1rem">
                    <div class="form-group" style="flex:1">
                      <input type="text" class="form-input card-input" formControlName="tarjetaVencimiento" placeholder="MM/YY">
                    </div>
                    <div class="form-group" style="flex:1">
                      <input type="password" class="form-input card-input" formControlName="tarjetaCvv" placeholder="CVV">
                    </div>
                  </div>
                </div>
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
    
    /* Payment UI */
    .payment-methods-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem; }
    .payment-card { border:2px solid var(--border); border-radius:var(--radius-md); padding:1rem; text-align:center; cursor:pointer; transition:all 0.2s ease; background:rgba(255,255,255,0.02); }
    .payment-card:hover { border-color:rgba(224,169,109,0.4); background:rgba(224,169,109,0.05); }
    .payment-card.active { border-color:var(--accent-gold); background:rgba(224,169,109,0.1); box-shadow:0 4px 12px rgba(224,169,109,0.15); }
    .payment-icon { font-size:2rem; margin-bottom:0.5rem; }
    .payment-name { font-weight:600; font-size:0.9rem; color:var(--text-primary); margin-bottom:0.25rem; }
    .payment-desc { font-size:0.75rem; color:var(--text-muted); }
    
    /* Fake Card UI */
    .card-simulation-wrapper { animation:slideDown 0.3s ease forwards; overflow:hidden; }
    .card-simulation { background:linear-gradient(135deg, #1f1f23, #131316); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-md); padding:1.5rem; box-shadow:0 10px 30px rgba(0,0,0,0.5); position:relative; overflow:hidden; }
    .card-simulation::before { content:''; position:absolute; top:-50px; right:-50px; width:150px; height:150px; border-radius:50%; background:radial-gradient(circle, rgba(224,169,109,0.1) 0%, transparent 70%); }
    .card-sim-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; font-size:0.8rem; color:#888; text-transform:uppercase; letter-spacing:1px; }
    .card-brands { display:flex; gap:0.5rem; }
    .brand { font-size:0.7rem; font-weight:800; padding:2px 6px; border-radius:3px; background:#333; color:#fff; }
    .brand.visa { background:#1a1f71; }
    .brand.mc { background:#eb001b; }
    .card-input { background:rgba(0,0,0,0.3) !important; border:1px solid rgba(255,255,255,0.1) !important; color:#fff !important; font-family:monospace !important; font-size:1.1rem !important; letter-spacing:2px; }
    .card-input:focus { border-color:var(--accent-gold) !important; box-shadow:0 0 0 3px rgba(224,169,109,0.2) !important; }
    
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
    @media(max-width:768px) { .checkout-layout { grid-template-columns:1fr; } .checkout-summary { order:-1; } }
    @media(max-width:480px) { .payment-methods-grid { grid-template-columns:1fr; } }
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
    observaciones: [''],
    metodoPago: ['EFECTIVO', Validators.required],
    tarjetaNumero: [''],
    tarjetaVencimiento: [''],
    tarjetaCvv: ['']
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
    
    let finalObs = this.form.value.observaciones || '';
    const pago = this.form.value.metodoPago;
    const pagoText = pago === 'EFECTIVO' ? 'Pago en Efectivo' : (pago === 'POS' ? 'POS contra entrega' : 'Tarjeta (Pagado online)');
    finalObs = `[${pagoText}] ${finalObs}`;

    const payload = {
      usuarioId: user.id,
      direccionEntrega: this.form.value.direccionEntrega!,
      observaciones: finalObs.trim(),
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
      error: (err: any) => { this.loading = false; this.toast.error(err?.error?.mensaje || 'Error al procesar el pedido'); }
    });
  }

  goHome(): void { this.router.navigate(['/']); }
  goMisPedidos(): void { this.router.navigate(['/mis-pedidos']); }
}
