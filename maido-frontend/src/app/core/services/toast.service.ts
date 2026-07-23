import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast { message: string; type: 'success' | 'error' | 'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: Toast['type'] = 'info', duration = 3500): void {
    const toast: Toast = { message, type };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => {
      this.toastsSubject.next(this.toastsSubject.value.filter(t => t !== toast));
    }, duration);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
  info(msg: string)    { this.show(msg, 'info'); }
}
