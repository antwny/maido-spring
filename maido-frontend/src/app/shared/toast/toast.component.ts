import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { Observable } from 'rxjs';
import { Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts$ | async"
           class="toast"
           [class.toast-success]="t.type==='success'"
           [class.toast-error]="t.type==='error'"
           [class.toast-info]="t.type==='info'">
        <span>{{ icon(t.type) }}</span> {{ t.message }}
      </div>
    </div>
  `
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  icon(type: string): string {
    return ({ success:'✅', error:'❌', info:'ℹ️' } as Record<string,string>)[type] ?? 'ℹ️';
  }
}
