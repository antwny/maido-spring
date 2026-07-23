import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoginResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly STORAGE_KEY = 'maido_user';
  private userSubject = new BehaviorSubject<LoginResponse | null>(this.loadFromStorage());

  user$ = this.userSubject.asObservable();

  get currentUser(): LoginResponse | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  get isAdmin(): boolean {
    return this.userSubject.value?.rol === 'ROLE_ADMIN';
  }

  setUser(user: LoginResponse): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.userSubject.next(null);
  }

  private loadFromStorage(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
