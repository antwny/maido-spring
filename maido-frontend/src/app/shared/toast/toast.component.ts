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
         <span style="font-size:1.2rem;line-height:1">{{ icon(t.type) }}</span> 
         <span style="flex:1">{{ t.message }}</span>
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
