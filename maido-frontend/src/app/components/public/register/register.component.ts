import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoginResponse } from '../../../core/models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-jp display-font">間道</span>
          <span class="logo-text">MAIDO</span>
        </div>
        <h2 class="auth-title">Crear Cuenta</h2>
        <p class="text-muted" style="text-align:center;margin-bottom:2rem">Únete a la experiencia Nikkei</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input type="text" class="form-input" formControlName="nombre" placeholder="Kenji">
              <span class="form-error" *ngIf="err('nombre')">Requerido</span>
            </div>
            <div class="form-group">
              <label class="form-label">Apellido</label>
              <input type="text" class="form-input" formControlName="apellido" placeholder="Fujimoto">
              <span class="form-error" *ngIf="err('apellido')">Requerido</span>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:1rem">
            <label class="form-label">Correo Electrónico</label>
            <input type="email" class="form-input" formControlName="email" placeholder="tu@correo.com">
            <span class="form-error" *ngIf="err('email')">Email inválido</span>
          </div>
          <div class="form-group" style="margin-bottom:1rem">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-input" formControlName="password" placeholder="Mínimo 6 caracteres">
            <span class="form-error" *ngIf="err('password')">Mínimo 6 caracteres</span>
          </div>
          <div class="form-group" style="margin-bottom:1rem">
            <label class="form-label">Teléfono (opcional)</label>
            <input type="tel" class="form-input" formControlName="telefono" placeholder="999 000 000">
          </div>
          <div class="form-group" style="margin-bottom:2rem">
            <label class="form-label">Dirección de entrega (opcional)</label>
            <input type="text" class="form-input" formControlName="direccion" placeholder="Av. La Mar 700, Miraflores">
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" [disabled]="loading">
            <span *ngIf="loading" class="btn-spinner"></span>
            {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-muted">¿Ya tienes cuenta? <a routerLink="/login" [queryParamsHandling]="'preserve'" class="text-accent">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:6rem 1rem 2rem; background:radial-gradient(ellipse at center, rgba(224,169,109,0.06) 0%, transparent 70%); }
    .auth-card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:2.5rem; width:100%; max-width:480px; box-shadow:var(--shadow-card); }
    .auth-logo { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-bottom:1.5rem; }
    .logo-jp { font-size:2rem; color:var(--accent-gold); }
    .logo-text { font-size:1.3rem; font-weight:800; letter-spacing:0.2em; }
    .auth-title { text-align:center; font-size:1.5rem; margin-bottom:0.5rem; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
    .form-group { display:flex; flex-direction:column; gap:0.4rem; }
    .error-msg { background:rgba(211,47,47,0.12); border:1px solid rgba(211,47,47,0.3); color:#f87171; border-radius:var(--radius-sm); padding:0.65rem 1rem; font-size:0.875rem; margin-bottom:1rem; }
    .auth-footer { text-align:center; margin-top:1.5rem; }
    .btn-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authSvc = inject(AuthService);
  private authState = inject(AuthStateService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.group({
    nombre:    ['', Validators.required],
    apellido:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    telefono:  [''],
    direccion: ['']
  });
  loading = false;
  errorMsg = '';

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = '';
    this.authSvc.register(this.form.value as any).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false;
        if (res.autenticado) {
          this.authState.setUser(res);
          this.toast.success('¡Bienvenido a Maido! 🎉');
          const ret = new URLSearchParams(window.location.search).get('returnUrl');
          this.router.navigateByUrl(ret || '/');
        } else {
          this.errorMsg = res.mensaje;
        }
      },
      error: (err: any) => { this.loading = false; this.errorMsg = 'Error de conexión'; }
    });
  }
}
