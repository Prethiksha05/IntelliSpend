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
          <i class="fa-solid fa-brain-circuit text-gradient"></i>
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
      background: #090d16;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      position: sticky;
      top: 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 8px 24px 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 24px;
    }
    .logo-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      color: #818cf8;
    }
    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
    }
    .brand-accent {
      color: #818cf8;
    }
    .brand-badge {
      font-size: 0.65rem;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 0.08em;
      display: block;
      margin-top: 2px;
    }
    .nav-section {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
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
      color: #94a3b8;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 10px;
      transition: all 0.2s ease;
      position: relative;
    }
    .nav-item:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.04);
    }
    .nav-item.active {
      color: #ffffff;
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%);
      border-left: 3px solid #6366f1;
    }
    .nav-item i {
      font-size: 1.05rem;
      width: 20px;
      text-align: center;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #f43f5e;
      margin-left: auto;
      box-shadow: 0 0 8px #f43f5e;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.6; }
    }
    .sidebar-footer {
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
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
      color: #ffffff;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .user-role {
      font-size: 0.7rem;
      color: #94a3b8;
    }
    .btn-logout {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 0.95rem;
      padding: 6px;
      transition: color 0.2s;
    }
    .btn-logout:hover {
      color: #f43f5e;
    }
  `]
})
export class SidebarComponent {
  constructor(public auth: AuthService) {}
}
