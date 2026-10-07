import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="app-layout" [class.no-sidebar]="isLoginPage()">
      <app-sidebar *ngIf="!isLoginPage()"></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }
    .main-content {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      background: radial-gradient(circle at 10% 10%, rgba(30, 41, 59, 0.4) 0%, transparent 80%),
                  radial-gradient(circle at 90% 90%, rgba(99, 102, 241, 0.05) 0%, transparent 60%);
    }
    .no-sidebar .main-content {
      width: 100%;
    }
  `]
})
export class App {
  constructor(private router: Router, public auth: AuthService) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
