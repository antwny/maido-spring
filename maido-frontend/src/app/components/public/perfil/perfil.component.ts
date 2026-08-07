import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="perfil-page">
      <div class="container">
        
        <div class="perfil-layout">
          <!-- Sidebar -->
          <div class="perfil-sidebar">
            <div class="user-card card">
              <div class="user-avatar-lg">{{ (user?.nombre?.charAt(0) || '') + (user?.apellido?.charAt(0) || '') }}</div>
              <h2 class="user-name">{{ user?.nombre }} {{ user?.apellido }}</h2>
              <p class="user-email text-muted">{{ user?.email }}</p>
              
              <div class="user-stats">
                <div class="stat">
                  <span class="stat-value text-gold">{{ user?.rol === 'ROLE_ADMIN' ? 'Admin' : 'Cliente' }}</span>
                  <span class="stat-label">Rol</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulario Principal -->
          <div class="perfil-content">
            <div class="card glass-card">
              <div class="card-header">
                <h2>Mis Datos Personales</h2>
                <p class="text-muted">Actualiza tu información para agilizar tus futuros pedidos.</p>
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="perfil-form">
                
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Nombre *</label>
                    <input type="text" class="form-input" formControlName="nombre">
                    <span class="form-error" *ngIf="err('nombre')">Requerido</span>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Apellido *</label>
                    <input type="text" class="form-input" formControlName="apellido">
                    <span class="form-error" *ngIf="err('apellido')">Requerido</span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Correo Electrónico</label>
                  <input type="email" class="form-input" [value]="user?.email" readonly style="opacity:0.6;cursor:not-allowed">
                  <small class="text-muted" style="display:block;margin-top:0.25rem">El correo no se puede cambiar.</small>
                </div>

                <h3 style="margin:2rem 0 1rem; border-bottom:1px solid var(--border); padding-bottom:0.5rem">Datos de Entrega por Defecto</h3>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input type="tel" class="form-input" formControlName="telefono" placeholder="Ej. 987654321">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Dirección Principal</label>
                  <input type="text" class="form-input" formControlName="direccion" placeholder="Ej. Av. La Paz 123, Miraflores">
                  <small class="text-muted" style="display:block;margin-top:0.25rem">Esta dirección se autocompletará al hacer Checkout.</small>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-ghost" (click)="resetForm()">Deshacer cambios</button>
                  <button type="submit" class="btn btn-primary" [disabled]="loading || form.pristine || form.invalid">
                    <span *ngIf="loading" class="btn-spinner"></span>
                    {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .perfil-page { padding-top:6rem; padding-bottom:4rem; min-height:100vh; }
    .perfil-layout { display:grid; grid-template-columns: 320px 1fr; gap: 2rem; align-items:start; }
    
    .user-card { text-align:center; padding:2rem 1.5rem; background:var(--bg-card); display:flex; flex-direction:column; align-items:center; }
    .user-avatar-lg { width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg, var(--accent-red), #992215); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:2.5rem; color:#fff; margin-bottom:1.5rem; box-shadow:0 10px 25px rgba(217,56,30,0.3); border:4px solid rgba(255,255,255,0.05); }
    .user-name { font-size:1.4rem; font-weight:800; margin-bottom:0.25rem; }
    .user-stats { margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid var(--border); width:100%; display:flex; justify-content:center; }
    .stat { display:flex; flex-direction:column; align-items:center; }
    .stat-value { font-size:1.25rem; font-weight:800; }
    .stat-label { font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-top:0.2rem; }
    
    .glass-card { background:var(--bg-card); padding:2.5rem; border-radius:var(--radius-lg); }
    .card-header { margin-bottom:2rem; }
    .card-header h2 { font-size:1.6rem; margin-bottom:0.4rem; }
    
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    
    .form-actions { margin-top:2.5rem; display:flex; justify-content:flex-end; gap:1rem; align-items:center; }
    .btn-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; display:inline-block; margin-right:0.5rem; vertical-align:middle; }
    
    @keyframes spin { to { transform:rotate(360deg); } }

    @media(max-width:850px) {
      .perfil-layout { grid-template-columns:1fr; }
      .form-row { grid-template-columns:1fr; gap:0; }
    }
  `]
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authState = inject(AuthStateService);
  private authSvc = inject(AuthService);
  private toast = inject(ToastService);

  user: any = null;
  loading = false;

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    telefono: [''],
    direccion: ['']
  });

  ngOnInit(): void {
    this.user = this.authState.currentUser;
    if (this.user) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.form.patchValue({
      nombre: this.user.nombre,
      apellido: this.user.apellido,
      telefono: this.user.telefono || '',
      direccion: this.user.direccion || ''
    });
    this.form.markAsPristine();
  }

  err(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.user) return;
    this.loading = true;
    
    this.authSvc.updateProfile(this.user.id, this.form.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.toast.success(res.mensaje || 'Perfil actualizado');
        this.authState.setUser(res);
        this.user = res;
        this.form.markAsPristine();
      },
      error: (err: any) => {
        this.loading = false;
        this.toast.error('Error al actualizar perfil');
      }
    });
  }
}
