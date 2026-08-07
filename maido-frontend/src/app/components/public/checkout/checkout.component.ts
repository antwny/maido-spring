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
        <h1 *ngIf="!success" style="margin-bottom:2rem;text-align:center">Finalizar <span class="text-accent">Compra</span></h1>

        <!-- PANTALLA DE ÉXITO -->
        <div *ngIf="success" class="success-screen">
          <div class="receipt-card">
            <div class="receipt-header">
              <div class="success-icon">✅</div>
              <h2>¡Pedido Confirmado!</h2>
              <p class="text-muted">Orden #{{ pedidoId }} recibida exitosamente</p>
            </div>
            
            <div class="tracker">
              <div class="tracker-step active">
                <div class="dot"></div>
                <div class="label">Recibido</div>
              </div>
              <div class="tracker-step">
                <div class="dot"></div>
                <div class="label">Cocina</div>
              </div>
              <div class="tracker-step">
                <div class="dot"></div>
                <div class="label">En camino</div>
              </div>
            </div>

            <div class="receipt-actions">
              <button class="btn btn-primary" (click)="goHome()">Volver al Inicio</button>
              <button class="btn btn-ghost" style="color:var(--accent-gold)" (click)="goMisPedidos()">Ver estado de mi orden →</button>
            </div>
          </div>
        </div>

        <!-- CHECKOUT NORMAL -->
        <div *ngIf="!success" class="checkout-layout">
          
          <!-- COLUMNA IZQUIERDA: FORMULARIO POR PASOS -->
          <div class="checkout-steps">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              
              <!-- PASO 1: ENTREGA -->
              <div class="step-card card">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <h3>Datos de Entrega</h3>
                </div>
                <div class="step-body">
                  <div class="form-group">
                    <label class="form-label">Nombre completo</label>
                    <input type="text" class="form-input readonly-input" [value]="userName" readonly>
                  </div>

                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1rem">
                    <div class="form-group" style="margin:0">
                      <label class="form-label">Teléfono *</label>
                      <input type="tel" class="form-input" formControlName="telefono" placeholder="Ej. 987654321">
                      <span class="form-error" *ngIf="err('telefono')">Requerido</span>
                    </div>
                    <div class="form-group" style="margin:0">
                      <label class="form-label">Dirección de entrega *</label>
                      <input type="text" class="form-input" formControlName="direccionEntrega" placeholder="Av. La Mar 700">
                      <span class="form-error" *ngIf="err('direccionEntrega')">Requerido</span>
                    </div>
                  </div>

                  <div class="form-group" style="margin:0">
                    <label class="form-label">Indicaciones Especiales (opcional)</label>
                    <textarea class="form-input" formControlName="observaciones" rows="2" placeholder="Tocar el timbre 2 veces, sin rocoto, etc."></textarea>
                  </div>
                </div>
              </div>

              <!-- PASO 2: PAGO -->
              <div class="step-card card">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <h3>Método de Pago</h3>
                </div>
                <div class="step-body">
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
                      <div class="payment-desc">Débito/Crédito al recibir</div>
                    </label>
                    <label class="payment-card" [class.active]="form.get('metodoPago')?.value === 'TARJETA'">
                      <input type="radio" formControlName="metodoPago" value="TARJETA" style="display:none">
                      <div class="payment-icon">💳</div>
                      <div class="payment-name">Tarjeta Web</div>
                      <div class="payment-desc">Pago online seguro</div>
                    </label>
                  </div>

                  <!-- SIMULADOR TARJETA (Glassmorphism) -->
                  <div class="card-simulation-wrapper" *ngIf="form.get('metodoPago')?.value === 'TARJETA'">
                    <div class="glass-card">
                      <div class="card-sim-header">
                        <span class="chip-icon">🖲️</span>
                        <div class="card-brands">
                          <span class="brand visa">VISA</span>
                          <span class="brand mc">MC</span>
                        </div>
                      </div>
                      
                      <div class="form-group" style="margin-bottom:1.5rem">
                        <label style="font-size:0.7rem;text-transform:uppercase;color:rgba(255,255,255,0.6)">Número de Tarjeta</label>
                        <input type="text" class="form-input card-input" formControlName="tarjetaNumero" placeholder="0000 0000 0000 0000" maxlength="19" (input)="formatCardNumber($event)">
                      </div>
                      
                      <div style="display:flex; gap:1.5rem">
                        <div class="form-group" style="flex:1;margin:0">
                          <label style="font-size:0.7rem;text-transform:uppercase;color:rgba(255,255,255,0.6)">Vence</label>
                          <input type="text" class="form-input card-input" formControlName="tarjetaVencimiento" placeholder="MM/YY" maxlength="5">
                        </div>
                        <div class="form-group" style="flex:1;margin:0">
                          <label style="font-size:0.7rem;text-transform:uppercase;color:rgba(255,255,255,0.6)">CVV</label>
                          <input type="password" class="form-input card-input" formControlName="tarjetaCvv" placeholder="•••" maxlength="4">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BOTON CONFIRMAR -->
              <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:1rem;font-size:1.1rem" [disabled]="loading">
                <span *ngIf="loading" class="btn-spinner"></span>
                {{ loading ? 'Procesando tu pedido...' : 'Pagar S/ ' + (total | number:'1.2-2') }}
              </button>
            </form>
          </div>

          <!-- COLUMNA DERECHA: RESUMEN STICKY -->
          <div class="summary-wrapper">
            <div class="card summary-card sticky">
              <h3 style="margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">Resumen de Orden</h3>
              
              <div class="summary-items">
                <div *ngFor="let item of items" class="summary-item">
                  <div class="item-img" [style.backgroundImage]="'url(' + (item.platillo.imagenUrl || 'assets/placeholder.jpg') + ')'"></div>
                  <div class="item-info">
                    <span class="item-name">{{ item.platillo.nombre }}</span>
                    <span class="item-qty">Cant: {{ item.cantidad }}</span>
                  </div>
                  <div class="item-price">S/ {{ (item.platillo.precio * item.cantidad) | number:'1.2-2' }}</div>
                </div>
              </div>

              <div class="summary-totals">
                <div class="order-line text-muted">
                  <span>Subtotal</span>
                  <span>S/ {{ total | number:'1.2-2' }}</span>
                </div>
                <div class="order-line text-muted">
                  <span>Envío</span>
                  <span style="color:#10b981">¡Gratis!</span>
                </div>
                <hr class="divider">
                <div class="order-line final-total">
                  <span>Total a Pagar</span>
                  <span class="text-gold">S/ {{ total | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page { padding-top:6rem; padding-bottom:4rem; min-height:100vh; }
    .checkout-layout { display:grid; grid-template-columns: 1fr 380px; gap: 2.5rem; align-items:start; }
    
    /* --- Steps --- */
    .step-card { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow:hidden; margin-bottom: 1.5rem; background: var(--bg-card); box-shadow: var(--shadow-card); }
    .step-header { background: rgba(0,0,0,0.2); padding: 1.25rem 1.5rem; display:flex; align-items:center; gap: 1rem; border-bottom: 1px solid var(--border); }
    .step-number { background: var(--accent-gold); color: #000; width: 28px; height: 28px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-weight: 800; font-size: 0.9rem; }
    .step-header h3 { margin: 0; font-size: 1.2rem; }
    .step-body { padding: 1.5rem; }
    .readonly-input { opacity: 0.7; background: rgba(255,255,255,0.02) !important; cursor: not-allowed; }

    /* --- Payment Methods --- */
    .payment-methods-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem; }
    .payment-card { border:2px solid var(--border); border-radius:var(--radius-md); padding:1.25rem 1rem; text-align:center; cursor:pointer; transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1); background:rgba(255,255,255,0.01); position:relative; overflow:hidden; }
    .payment-card:hover { border-color:rgba(224,169,109,0.3); transform:translateY(-2px); }
    .payment-card.active { border-color:var(--accent-gold); background:rgba(224,169,109,0.05); transform:translateY(-2px); box-shadow:0 8px 20px -5px rgba(224,169,109,0.2); }
    .payment-icon { font-size:2rem; margin-bottom:0.5rem; transition:transform 0.2s; }
    .payment-card.active .payment-icon { transform:scale(1.1); }
    .payment-name { font-weight:700; font-size:0.9rem; color:var(--text-primary); margin-bottom:0.25rem; }
    .payment-desc { font-size:0.75rem; color:var(--text-muted); line-height:1.2; }

    /* --- Glassmorphism Card Simulation --- */
    .card-simulation-wrapper { animation:slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; transform-origin: top center; }
    .glass-card { background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02)); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem; position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .glass-card::before { content:''; position:absolute; top:-30%; right:-10%; width:200px; height:200px; border-radius:50%; background: radial-gradient(circle, rgba(224,169,109,0.2) 0%, transparent 70%); z-index:0; }
    .glass-card > * { position: relative; z-index: 1; }
    .card-sim-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    .chip-icon { font-size: 2rem; opacity:0.8; }
    .card-brands { display:flex; gap:0.5rem; }
    .brand { font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:4px; color:#fff; }
    .brand.visa { background:linear-gradient(135deg, #1a1f71, #252b99); }
    .brand.mc { background:linear-gradient(135deg, #eb001b, #ff5f00); }
    .card-input { background:rgba(0,0,0,0.3) !important; border:1px solid rgba(255,255,255,0.1) !important; color:#fff !important; font-family:'Courier New', Courier, monospace !important; font-size:1.15rem !important; letter-spacing:1px; border-radius: 8px; }
    .card-input:focus { border-color:var(--accent-gold) !important; background:rgba(0,0,0,0.5) !important; box-shadow:none !important; }

    /* --- Summary Sticky Sidebar --- */
    .summary-card { padding: 1.5rem; border:1px solid var(--border); border-radius: var(--radius-lg); background:var(--bg-card); }
    .sticky { position: sticky; top: 6rem; }
    .summary-items { max-height: 40vh; overflow-y:auto; margin-bottom: 1.5rem; padding-right:0.5rem; }
    .summary-items::-webkit-scrollbar { width:4px; }
    .summary-items::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
    .summary-item { display:flex; align-items:center; gap:1rem; margin-bottom:1rem; }
    .item-img { width: 50px; height: 50px; border-radius: 50%; background-size: cover; background-position: center; border:2px solid rgba(255,255,255,0.05); flex-shrink:0; }
    .item-info { flex: 1; display:flex; flex-direction:column; gap:0.2rem; }
    .item-name { font-weight:600; font-size:0.9rem; line-height:1.2; }
    .item-qty { font-size:0.75rem; color:var(--text-muted); }
    .item-price { font-weight:700; font-size:0.95rem; }
    .order-line { display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:0.9rem; }
    .final-total { font-weight:800; font-size:1.25rem; margin-top:1rem; margin-bottom:0; color:#fff; }
    
    /* --- Success Screen --- */
    .success-screen { display:flex; justify-content:center; align-items:center; padding: 2rem 0; animation: fadeIn 0.5s ease; }
    .receipt-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 480px; padding: 3rem 2rem; text-align:center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); position:relative; overflow:hidden; }
    .receipt-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, var(--accent-gold), var(--accent-red)); }
    .success-icon { font-size:4rem; margin-bottom:1rem; animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .receipt-header h2 { margin-bottom: 0.5rem; font-size: 1.8rem; }
    
    /* Tracker */
    .tracker { display:flex; justify-content:space-between; margin: 3rem 0; position:relative; }
    .tracker::before { content:''; position:absolute; top:8px; left:20px; right:20px; height:2px; background:rgba(255,255,255,0.1); z-index:0; }
    .tracker-step { display:flex; flex-direction:column; align-items:center; gap:0.5rem; position:relative; z-index:1; }
    .dot { width:18px; height:18px; border-radius:50%; background:var(--bg-card); border:2px solid rgba(255,255,255,0.2); transition:all 0.3s; }
    .label { font-size:0.8rem; color:var(--text-muted); font-weight:600; }
    .tracker-step.active .dot { background:#10b981; border-color:#10b981; box-shadow:0 0 10px rgba(16,185,129,0.5); }
    .tracker-step.active .label { color:#10b981; }

    .receipt-actions { display:flex; flex-direction:column; gap:1rem; margin-top:2rem; }

    .btn-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; display:inline-block; margin-right:0.5rem; vertical-align:middle; }
    
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes slideDown { from { opacity:0; transform:translateY(-15px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes popIn { 0% { opacity:0; transform:scale(0.5); } 70% { transform:scale(1.2); } 100% { opacity:1; transform:scale(1); } }

    @media(max-width:900px) { 
      .checkout-layout { grid-template-columns:1fr; } 
      .summary-wrapper { order:-1; }
      .sticky { position: relative; top: 0; }
    }
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
    telefono: ['', Validators.required],
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
    this.cart.items$.subscribe((i: CartItem[]) => { 
      this.items = i; 
      this.total = i.reduce((a,c) => a + c.platillo.precio * c.cantidad, 0); 
    });
    
    const u = this.authState.currentUser;
    if (u) { 
      this.userName = `${u.nombre} ${u.apellido}`; 
      
      const patchData: any = {};
      if (u.direccion) patchData.direccionEntrega = u.direccion;
      if (u.telefono) patchData.telefono = u.telefono;
      
      this.form.patchValue(patchData);
    }
    
    if (!this.authState.isLoggedIn) { 
      this.router.navigate(['/login']); 
    }
  }

  formatCardNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (input.length > 16) input = input.substring(0, 16);
    // Add spaces every 4 digits
    let formatted = '';
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += input[i];
    }
    this.form.get('tarjetaNumero')?.setValue(formatted, { emitEvent: false });
  }

  err(f: string): boolean { 
    const c = this.form.get(f); 
    return !!(c?.invalid && c?.touched); 
  }

  /**
   * Flujo de Checkout (Sustentación):
   * 1. Validamos que el formulario HTML (Reactive Forms) sea correcto.
   * 2. Recuperamos el carrito y el usuario activo.
   * 3. Transformamos (mapeamos) los datos del frontend al DTO (PedidoRequest)
   *    exactamente como el Backend (Spring Boot) lo espera recibir en JSON.
   * 4. Hacemos la petición HTTP POST asíncrona mediante el PedidoService.
   */
  onSubmit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); // Muestra mensajes de error en rojo
      return; 
    }
    
    if (this.items.length === 0) { 
      this.toast.error('El carrito está vacío'); 
      return; 
    }
    
    this.loading = true;
    const user = this.authState.currentUser!;
    
    let finalObs = this.form.value.observaciones || '';
    const pago = this.form.value.metodoPago;
    const pagoText = pago === 'EFECTIVO' ? 'Efectivo' : (pago === 'POS' ? 'POS' : 'Tarjeta Web');
    const tel = this.form.value.telefono;
    
    // Agregamos el teléfono y método de pago al inicio de las observaciones para que el admin lo vea
    finalObs = `[Pago: ${pagoText}] [Tel: ${tel}] ${finalObs}`;

    // Payload = El JSON que viajará por la red hacia el Spring Boot (Coincide con PedidoRequest.java)
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

    // Llamada HTTP POST real. Como es asíncrono, usamos .subscribe()
    this.pedidoSvc.create(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = true;
        this.pedidoId = res.id;
        this.cart.clear();
      },
      error: (err: any) => { 
        this.loading = false; 
        this.toast.error(err?.error?.mensaje || 'Error al procesar el pedido'); 
      }
    });
  }

  goHome(): void { this.router.navigate(['/']); }
  goMisPedidos(): void { this.router.navigate(['/mis-pedidos']); }
}
