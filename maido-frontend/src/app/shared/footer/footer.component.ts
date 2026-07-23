import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="logo-jp display-font">間道</span>
          <span class="logo-text">MAIDO</span>
          <p class="footer-tagline">Alta cocina Nikkei · Lima, Perú</p>
        </div>
        <div class="footer-links">
          <a routerLink="/">Inicio</a>
          <a routerLink="/catalogo">Menú</a>
          <a routerLink="/login">Mi cuenta</a>
        </div>
        <p class="footer-copy">© 2026 Maido Restaurant. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background:var(--bg-secondary); border-top:1px solid var(--border);
      padding:2.5rem 0 1.5rem;
    }
    .footer-inner { display:flex; flex-direction:column; align-items:center; gap:1rem; text-align:center; }
    .footer-brand { display:flex; align-items:center; gap:0.5rem; }
    .logo-jp { font-size:1.4rem; color:var(--accent-gold); }
    .logo-text { font-weight:800; letter-spacing:0.15em; }
    .footer-tagline { color:var(--text-muted); font-size:0.85rem; margin-left:0.5rem; }
    .footer-links { display:flex; gap:2rem; }
    .footer-links a { color:var(--text-muted); font-size:0.9rem; transition:color 0.2s; }
    .footer-links a:hover { color:var(--accent-gold); }
    .footer-copy { color:var(--text-dim); font-size:0.8rem; }
  `]
})
export class FooterComponent {}
