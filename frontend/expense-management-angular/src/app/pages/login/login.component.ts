import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card glass-panel">
        <div class="brand-header">
          <div class="logo-box">
            <i class="fa-solid fa-brain-circuit"></i>
          </div>
          <h2>Intelli<span class="gradient-text">Spend</span></h2>
          <p class="tagline">Next-Generation Expense Intelligence & Anomaly Detection</p>
        </div>

        <!-- 1-Click Fast Showcase Button -->
        <div class="demo-banner">
          <div class="demo-info">
            <span class="demo-title"><i class="fa-solid fa-bolt text-amber"></i> Quick Presentation Mode</span>
            <span class="demo-desc">Prefilled with verified financial data and active ML anomalies</span>
          </div>
          <button (click)="fastDemoLogin()" class="btn btn-primary btn-sm">
            Launch Showcase
          </button>
        </div>

        <form (ngSubmit)="login()" class="login-form">
          <div class="form-group">
            <label class="form-label">Username or Email</label>
            <input type="text" [(ngModel)]="username" name="username" class="form-control" placeholder="alex_morgan" required>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" [(ngModel)]="password" name="password" class="form-control" placeholder="••••••••••••" required>
          </div>

          <button type="submit" class="btn btn-secondary w-full" [disabled]="loading">
            Sign In with Credentials
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.1) 0%, #f8fafc 80%);
      padding: 24px;
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 36px 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08);
    }
    .brand-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .logo-box {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      color: #ffffff;
      margin-bottom: 6px;
      box-shadow: 0 6px 15px rgba(79, 70, 229, 0.25);
    }
    .brand-header h2 {
      font-size: 1.6rem;
      color: #0f172a;
      font-weight: 800;
    }
    .tagline {
      font-size: 0.85rem;
      color: #64748b;
    }
    .demo-banner {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .demo-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .demo-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #b45309;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .demo-desc {
      font-size: 0.74rem;
      color: #78350f;
    }
    .w-full {
      width: 100%;
      margin-top: 8px;
    }
    .text-amber {
      color: #fbbf24;
    }
  `]
})
export class LoginComponent {
  username = 'alex_morgan';
  password = 'Password123!';
  loading = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  fastDemoLogin() {
    this.login();
  }

  login() {
    this.loading = true;
    this.api.login({ username: this.username, password: this.password }).subscribe(res => {
      this.auth.setSession(res);
      this.loading = false;
      this.router.navigate(['/dashboard']);
    });
  }
}
