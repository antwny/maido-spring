import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, CommonModule],
  template: `
    <app-navbar *ngIf="showPublicNav"></app-navbar>
    <router-outlet></router-outlet>
    <app-footer *ngIf="showPublicNav"></app-footer>
    <app-toast></app-toast>
  `,
  styles: [`
    :host { display:flex; flex-direction:column; min-height:100vh; }
  `]
})
export class AppComponent implements OnInit {
  showPublicNav = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.showPublicNav = !e.url.startsWith('/admin');
    });
  }
}

