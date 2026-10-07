import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { DashboardSummary, Expense, Category } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-page">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Executive Financial Overview</h1>
          <p class="page-subtitle">Real-time expenditure intelligence & ML-powered behavioral anomaly detection</p>
        </div>
        <div class="header-actions">
          <button (click)="openExpenseModal()" class="btn btn-primary">
            <i class="fa-solid fa-plus"></i> Record Transaction
          </button>
        </div>
      </header>

      <!-- Critical Anomaly Alert Banner -->
      <div class="anomaly-banner glass-panel" *ngIf="summary?.recentAnomalies?.length">
        <div class="banner-icon">
          <i class="fa-solid fa-shield-virus"></i>
        </div>
        <div class="banner-content">
          <div class="banner-title">
            <span>Machine Learning Security Warning</span>
            <span class="badge badge-critical">{{ summary?.recentAnomalies?.length }} Suspicious Pattern(s)</span>
          </div>
          <p class="banner-text">
            Our Isolation Forest ML model flagged a <strong>{{ summary?.recentAnomalies?.[0]?.title }}</strong>
            for <strong>{{ summary?.recentAnomalies?.[0]?.amount | currency }}</strong>.
            Reason: {{ summary?.recentAnomalies?.[0]?.anomalyReason }}
          </p>
        </div>
        <button (click)="selectedAnomaly = summary?.recentAnomalies?.[0]" class="btn btn-sm btn-danger">
          Inspect Outlier
        </button>
      </div>

      <!-- Stat Cards Grid -->
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper icon-emerald">
            <i class="fa-solid fa-wallet"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Spent This Month</span>
            <h2 class="stat-value">{{ summary?.totalSpentThisMonth | currency }}</h2>
            <div class="stat-trend trend-neutral">
              <i class="fa-solid fa-calendar-check"></i>
              <span>Monthly Budget: {{ summary?.monthlyBudgetLimit | currency }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper icon-rose">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">ML Anomalies Detected</span>
            <h2 class="stat-value text-rose">{{ summary?.anomalyCount }}</h2>
            <div class="stat-trend trend-down">
              <i class="fa-solid fa-microchip"></i>
              <span>Isolation Forest Score: >0.85</span>
            </div>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper icon-purple">
            <i class="fa-solid fa-gauge-high"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Budget Consumption</span>
            <h2 class="stat-value">{{ summary?.budgetUsagePercentage }}%</h2>
            <div class="progress-bar-container">
              <div class="progress-bar" [style.width.%]="summary?.budgetUsagePercentage"></div>
            </div>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper icon-amber">
            <i class="fa-solid fa-fire"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Top Spending Vector</span>
            <h2 class="stat-value">{{ summary?.topSpendingCategory }}</h2>
            <div class="stat-trend trend-neutral">
              <i class="fa-solid fa-arrow-trend-up"></i>
              <span>Highest Single: {{ summary?.highestExpenseAmount | currency }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Columns: Categories & Recent Transactions -->
      <div class="dashboard-columns">
        <!-- Category Breakdown Card -->
        <div class="card-column glass-panel">
          <div class="card-header">
            <h3><i class="fa-solid fa-chart-pie"></i> Category Allocation</h3>
            <span class="badge badge-normal">Live Telemetry</span>
          </div>

          <div class="category-bars">
            <div class="category-bar-item" *ngFor="let cat of summary?.categoryBreakdowns">
              <div class="cat-bar-header">
                <span class="cat-name">{{ cat.category }}</span>
                <span class="cat-amount">{{ cat.amount | currency }} ({{ cat.percentage }}%)</span>
              </div>
              <div class="cat-meter-track">
                <div class="cat-meter-fill" [style.width.%]="cat.percentage" [style.backgroundColor]="cat.colorCode"></div>
              </div>
            </div>
          </div>

          <!-- ML Confidence Box -->
          <div class="ml-status-box">
            <div class="ml-status-header">
              <i class="fa-solid fa-circle-check text-emerald"></i>
              <span>ML Engine Active: Isolation Forest & Scikit-learn</span>
            </div>
            <p class="ml-status-text">
              Categorization and outlier scores are evaluated in real-time with sub-20ms latency.
            </p>
          </div>
        </div>

        <!-- Recent Transactions Table Card -->
        <div class="card-column glass-panel">
          <div class="card-header">
            <h3><i class="fa-solid fa-receipt"></i> Recent Activity & ML Verification</h3>
            <span class="sub-link">Auto-Scored</span>
          </div>

          <div class="transactions-list">
            <div class="transaction-row" *ngFor="let tx of summary?.recentTransactions">
              <div class="tx-icon" [style.backgroundColor]="tx.categoryColor + '20'" [style.color]="tx.categoryColor">
                <i class="fa-solid" [ngClass]="tx.categoryIcon || 'fa-receipt'"></i>
              </div>

              <div class="tx-details">
                <div class="tx-top">
                  <span class="tx-title">{{ tx.title }}</span>
                  <span class="tx-amount" [class.text-rose]="tx.isAnomaly">{{ tx.amount | currency }}</span>
                </div>
                <div class="tx-bottom">
                  <span class="tx-meta">{{ tx.categoryName }} • {{ tx.expenseDate }}</span>
                  <span *ngIf="tx.isAnomaly" class="badge badge-critical" (click)="selectedAnomaly = tx">
                    <i class="fa-solid fa-triangle-exclamation"></i> {{ tx.anomalySeverity }} ({{ tx.anomalyScore }})
                  </span>
                  <span *ngIf="!tx.isAnomaly" class="badge badge-normal">
                    <i class="fa-solid fa-check"></i> Normal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Expense Modal -->
      <div class="modal-overlay" *ngIf="showAddModal">
        <div class="modal-content glass-panel">
          <div class="modal-header">
            <h3><i class="fa-solid fa-bolt text-indigo"></i> Record New Expense & ML Audit</h3>
            <button (click)="showAddModal = false" class="modal-close">&times;</button>
          </div>

          <form (ngSubmit)="saveExpense()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Expense Title / Merchant</label>
              <input type="text" [(ngModel)]="newExpense.title" name="title" class="form-control" placeholder="e.g. Flight to San Francisco, Apple Store" required>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Amount ($ USD)</label>
                <input type="number" step="0.01" [(ngModel)]="newExpense.amount" name="amount" class="form-control" placeholder="0.00" required>
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Date</label>
                <input type="date" [(ngModel)]="newExpense.expenseDate" name="expenseDate" class="form-control" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Category</label>
                <select [(ngModel)]="newExpense.categoryId" name="categoryId" class="form-control" required>
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Payment Method</label>
                <select [(ngModel)]="newExpense.paymentMethod" name="paymentMethod" class="form-control">
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Wire</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description / Context (optional)</label>
              <input type="text" [(ngModel)]="newExpense.description" name="description" class="form-control" placeholder="Notes on expense purpose">
            </div>

            <div class="modal-footer">
              <button type="button" (click)="showAddModal = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading">
                <i class="fa-solid fa-microchip"></i> Evaluate & Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Anomaly Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedAnomaly">
        <div class="modal-content glass-panel">
          <div class="modal-header">
            <h3><i class="fa-solid fa-triangle-exclamation text-rose"></i> AI Anomaly Forensic Report</h3>
            <button (click)="selectedAnomaly = null" class="modal-close">&times;</button>
          </div>

          <div class="modal-body">
            <div class="anomaly-score-header">
              <div class="score-dial">
                <span class="score-number">{{ selectedAnomaly.anomalyScore }}</span>
                <span class="score-label">OUTLIER SCORE</span>
              </div>
              <div class="score-meta">
                <h4 class="text-rose">{{ selectedAnomaly.title }}</h4>
                <p class="score-amount">{{ selectedAnomaly.amount | currency }}</p>
                <span class="badge badge-critical">{{ selectedAnomaly.anomalySeverity }} SEVERITY</span>
              </div>
            </div>

            <div class="anomaly-detail-card">
              <h5><i class="fa-solid fa-robot"></i> Isolation Forest Forensic Rationale:</h5>
              <p class="anomaly-reason-text">{{ selectedAnomaly.anomalyReason }}</p>
            </div>

            <div class="anomaly-actions">
              <p class="feedback-prompt">Review Feedback to retrain model:</p>
              <div class="feedback-buttons">
                <button (click)="submitFeedback('CONFIRMED')" class="btn btn-danger btn-sm">
                  <i class="fa-solid fa-triangle-exclamation"></i> Confirm Suspicious
                </button>
                <button (click)="submitFeedback('FALSE_POSITIVE')" class="btn btn-secondary btn-sm">
                  <i class="fa-solid fa-check"></i> Legitimate Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: #94a3b8;
      margin-top: 4px;
    }
    .anomaly-banner {
      background: linear-gradient(90deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1px solid rgba(244, 63, 94, 0.35);
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .banner-icon {
      font-size: 2rem;
      color: #fb7185;
    }
    .banner-content {
      flex: 1;
    }
    .banner-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      color: #ffffff;
      font-size: 1rem;
      margin-bottom: 4px;
    }
    .banner-text {
      color: #cbd5e1;
      font-size: 0.88rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }
    .stat-card {
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .icon-rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
    .icon-purple { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    .icon-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .stat-info {
      flex: 1;
    }
    .stat-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffffff;
      margin: 4px 0 8px 0;
    }
    .text-rose { color: #fb7185; }
    .text-emerald { color: #34d399; }
    .stat-trend {
      font-size: 0.78rem;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #94a3b8;
    }
    .progress-bar-container {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
      margin-top: 6px;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #ec4899);
      border-radius: 10px;
    }
    .dashboard-columns {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 24px;
    }
    .card-column {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .category-bars {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .cat-bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 6px;
    }
    .cat-name { color: #f1f5f9; font-weight: 600; }
    .cat-amount { color: #94a3b8; font-family: var(--font-mono); font-size: 0.8rem; }
    .cat-meter-track {
      height: 8px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      overflow: hidden;
    }
    .cat-meter-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.4s ease;
    }
    .ml-status-box {
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 12px;
      padding: 14px;
      margin-top: auto;
    }
    .ml-status-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      color: #ffffff;
      margin-bottom: 4px;
    }
    .ml-status-text {
      font-size: 0.78rem;
      color: #94a3b8;
      line-height: 1.4;
    }
    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .transaction-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 0.2s;
    }
    .transaction-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .tx-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .tx-details {
      flex: 1;
    }
    .tx-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .tx-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #ffffff;
    }
    .tx-amount {
      font-size: 0.92rem;
      font-weight: 700;
      font-family: var(--font-mono);
      color: #ffffff;
    }
    .tx-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tx-meta {
      font-size: 0.75rem;
      color: #64748b;
    }
    /* Modals */
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      font-size: 1.15rem;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .modal-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #94a3b8;
      cursor: pointer;
    }
    .modal-body {
      padding: 24px;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .flex-1 { flex: 1; }
    /* Anomaly Modal */
    .anomaly-score-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    .score-dial {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid #fb7185;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(244, 63, 94, 0.1);
    }
    .score-number {
      font-size: 1.2rem;
      font-weight: 800;
      color: #fb7185;
      font-family: var(--font-mono);
    }
    .score-label {
      font-size: 0.55rem;
      font-weight: 700;
      color: #cbd5e1;
      letter-spacing: 0.05em;
    }
    .score-amount {
      font-size: 1.4rem;
      font-weight: 800;
      color: #ffffff;
      margin: 2px 0 6px 0;
    }
    .anomaly-detail-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .anomaly-detail-card h5 {
      color: #94a3b8;
      font-size: 0.85rem;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .anomaly-reason-text {
      color: #f1f5f9;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .feedback-prompt {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .feedback-buttons {
      display: flex;
      gap: 12px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  categories: Category[] = [];
  showAddModal = false;
  selectedAnomaly: Expense | null = null;
  loading = false;

  newExpense: Expense = {
    title: '',
    amount: 0,
    categoryId: 1,
    expenseDate: new Date().toISOString().substring(0, 10),
    paymentMethod: 'CREDIT_CARD',
    description: ''
  };

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getDashboardSummary().subscribe(s => this.summary = s);
    this.api.getCategories().subscribe(c => this.categories = c);
  }

  openExpenseModal() {
    this.newExpense = {
      title: '',
      amount: 0,
      categoryId: this.categories[0]?.id || 1,
      expenseDate: new Date().toISOString().substring(0, 10),
      paymentMethod: 'CREDIT_CARD',
      description: ''
    };
    this.showAddModal = true;
  }

  saveExpense() {
    if (!this.newExpense.title || this.newExpense.amount <= 0) return;
    this.loading = true;
    this.api.createExpense(this.newExpense).subscribe(() => {
      this.loading = false;
      this.showAddModal = false;
      this.loadData();
    });
  }

  submitFeedback(status: string) {
    if (this.selectedAnomaly?.id) {
      this.api.submitAnomalyFeedback(this.selectedAnomaly.id, status).subscribe(() => {
        this.selectedAnomaly = null;
        this.loadData();
      });
    } else {
      this.selectedAnomaly = null;
    }
  }
}
