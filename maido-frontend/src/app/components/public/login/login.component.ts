import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-jp display-font">間道</span>
          <span class="logo-text">MAIDO</span>
        </div>
        <h2 class="auth-title">Iniciar Sesión</h2>
        <p class="text-muted" style="text-align:center;margin-bottom:2rem">Accede a tu cuenta para realizar pedidos</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group" style="margin-bottom:1.25rem">
            <label class="form-label">Correo Electrónico</label>
            <input type="email" class="form-input" formControlName="email"
                   placeholder="tu@correo.com"
                   [class.error]="form.get('email')?.invalid && form.get('email')?.touched">
            <span class="form-error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">Email inválido</span>
          </div>
          <div class="form-group" style="margin-bottom:2rem">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-input" formControlName="password"
                   placeholder="••••••••"
                   [class.error]="form.get('password')?.invalid && form.get('password')?.touched">
            <span class="form-error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">Mínimo 6 caracteres</span>
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center"
                  [disabled]="loading">
            <span *ngIf="loading" class="btn-spinner"></span>
            {{ loading ? 'Verificando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-muted">¿No tienes cuenta? <a routerLink="/register" [queryParamsHandling]="'preserve'" class="text-accent">Regístrate</a></p>
        </div>

        <!-- Demo creds -->
        <div class="demo-box">
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem">🧪 Credenciales de prueba:</p>
          <button class="demo-btn" (click)="fillDemo('admin')">Admin: admin&#64;maido.pe / admin123</button>
          <button class="demo-btn" (click)="fillDemo('cliente')">Cliente: kenji&#64;cliente.pe / cliente123</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height:100vh; display:flex; align-items:center; justify-content:center;
      padding:6rem 1rem 2rem;
      background:radial-gradient(ellipse at center, rgba(217,56,30,0.06) 0%, transparent 70%);
    }
    .auth-card {
      background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg);
      padding:2.5rem; width:100%; max-width:420px; box-shadow:var(--shadow-card);
    }
    .auth-logo { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-bottom:1.5rem; }
    .logo-jp { font-size:2rem; color:var(--accent-gold); }
    .logo-text { font-size:1.3rem; font-weight:800; letter-spacing:0.2em; }
    .auth-title { text-align:center; font-size:1.5rem; margin-bottom:0.5rem; }
    .error-msg { background:rgba(211,47,47,0.12); border:1px solid rgba(211,47,47,0.3); color:#f87171; border-radius:var(--radius-sm); padding:0.65rem 1rem; font-size:0.875rem; margin-bottom:1rem; }
    .auth-footer { text-align:center; margin-top:1.5rem; }
    .btn-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .demo-box { margin-top:1.5rem; padding:0.75rem; background:rgba(255,255,255,0.03); border:1px dashed var(--border); border-radius:var(--radius-sm); }
    .demo-btn { display:block; width:100%; text-align:left; background:none; border:none; color:var(--accent-gold); font-size:0.8rem; cursor:pointer; padding:0.25rem 0; font-family:inherit; }
    .demo-btn:hover { color:var(--accent-gold-light); }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authSvc = inject(AuthService);
  private authState = inject(AuthStateService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  loading = false;
  errorMsg = '';

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = '';
    this.authSvc.login(this.form.value as any).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.autenticado) {
          this.authState.setUser(res);
          this.toast.success(`¡Bienvenido, ${res.nombre}!`);
          const ret = new URLSearchParams(window.location.search).get('returnUrl');
          this.router.navigateByUrl(ret || (res.rol === 'ROLE_ADMIN' ? '/admin/dashboard' : '/'));
        } else {
          this.errorMsg = res.mensaje;
        }
      },
      error: (err: any) => { this.loading = false; this.errorMsg = err?.error?.mensaje || 'Error de conexión con el servidor'; }
    });
  }

  fillDemo(type: 'admin' | 'cliente'): void {
    const creds = {
      admin: { email: 'admin@maido.pe', password: 'admin123' },
      cliente: { email: 'kenji@cliente.pe', password: 'cliente123' }
    };
    this.form.patchValue(creds[type]);
  }
}
