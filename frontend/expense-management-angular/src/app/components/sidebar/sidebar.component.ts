import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="logo-box">
          <i class="fa-solid fa-brain-circuit"></i>
        </div>
        <div class="brand-text">
          <span class="brand-title">Intelli<span class="brand-accent">Spend</span></span>
          <span class="brand-badge">AI PLATFORM</span>
        </div>
      </div>

      <div class="nav-section">MAIN MENU</div>
      <nav class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <i class="fa-solid fa-chart-pie"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/expenses" routerLinkActive="active" class="nav-item">
          <i class="fa-solid fa-receipt"></i>
          <span>Transactions</span>
        </a>
        <a routerLink="/anomalies" routerLinkActive="active" class="nav-item anomaly-nav">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>ML Anomalies</span>
          <span class="pulse-dot"></span>
        </a>
        <a routerLink="/budgets" routerLinkActive="active" class="nav-item">
          <i class="fa-solid fa-wallet"></i>
          <span>Budgets & Goals</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile" *ngIf="auth.currentUser() as user">
          <div class="avatar">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</div>
          <div class="user-details">
            <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
            <span class="user-role">{{ user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Premium Tier' }}</span>
          </div>
          <button (click)="auth.logout()" class="btn-logout" title="Sign out">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      position: sticky;
      top: 0;
      box-shadow: 2px 0 10px rgba(15, 23, 42, 0.02);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 8px 20px 8px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 24px;
    }
    .logo-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
    }
    .brand-title {
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
    }
    .brand-accent {
      color: #4f46e5;
    }
    .brand-badge {
      font-size: 0.65rem;
      font-weight: 700;
      color: #0284c7;
      letter-spacing: 0.08em;
      display: block;
      margin-top: 2px;
    }
    .nav-section {
      font-size: 0.7rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.08em;
      padding: 0 12px 10px 12px;
    }
    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      color: #475569;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 10px;
      transition: all 0.2s ease;
      position: relative;
    }
    .nav-item:hover {
      color: #0f172a;
      background: #f8fafc;
    }
    .nav-item.active {
      color: #4f46e5;
      background: #eff6ff;
      border-left: 3px solid #4f46e5;
      font-weight: 700;
    }
    .nav-item i {
      font-size: 1.05rem;
      width: 20px;
      text-align: center;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e11d48;
      margin-left: auto;
      box-shadow: 0 0 6px rgba(225, 29, 72, 0.5);
    }
    .sidebar-footer {
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .user-role {
      font-size: 0.7rem;
      color: #64748b;
    }
    .btn-logout {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.95rem;
      padding: 6px;
      transition: color 0.2s;
    }
    .btn-logout:hover {
      color: #e11d48;
    }
  `]
})
export class SidebarComponent {
  constructor(public auth: AuthService) {}
}
