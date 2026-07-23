import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  router.navigate(['/login'], { queryParams: { returnUrl: location.pathname } });
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  if (auth.isAdmin) return true;
  router.navigate(['/']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  if (!auth.isLoggedIn) return true;
  router.navigate([auth.isAdmin ? '/admin/dashboard' : '/']);
  return false;
};
