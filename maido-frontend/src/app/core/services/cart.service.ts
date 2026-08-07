import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Platillo } from '../models/models';

/**
 * CartService maneja el estado global del carrito de compras.
 * 
 * Concepto Clave para Sustentación: RxJS y BehaviorSubject.
 * Usamos BehaviorSubject porque nos permite mantener el "estado actual" de los items
 * y notificar automáticamente a cualquier componente (ej. Navbar, Checkout) 
 * cuando algo cambia (como agregar un platillo), sin necesidad de recargar la página.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  items$ = this.itemsSubject.asObservable();

  get items(): CartItem[] { return this.itemsSubject.value; }

  get totalItems(): number {
    return this.items.reduce((acc, i) => acc + i.cantidad, 0);
  }

  get totalPrice(): number {
    return this.items.reduce((acc, i) => acc + i.platillo.precio * i.cantidad, 0);
  }

  addItem(platillo: Platillo): void {
    const current = [...this.items];
    const idx = current.findIndex(i => i.platillo.id === platillo.id);
    if (idx >= 0) {
      current[idx] = { ...current[idx], cantidad: current[idx].cantidad + 1 };
    } else {
      current.push({ platillo, cantidad: 1 });
    }
    this.save(current);
  }

  removeItem(platilloId: number): void {
    this.save(this.items.filter(i => i.platillo.id !== platilloId));
  }

  updateQuantity(platilloId: number, cantidad: number): void {
    if (cantidad <= 0) { this.removeItem(platilloId); return; }
    this.save(this.items.map(i =>
      i.platillo.id === platilloId ? { ...i, cantidad } : i
    ));
  }

  clear(): void { this.save([]); }

  private save(items: CartItem[]): void {
    localStorage.setItem('maido_cart', JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  private loadCart(): CartItem[] {
    try {
      const raw = localStorage.getItem('maido_cart');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
