import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Budget } from '../../models/models';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="budgets-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Budget Ceiling Controls</h1>
          <p class="page-subtitle">Set monthly allocations, monitor threshold triggers, and prevent overspending</p>
        </div>
      </header>

      <div class="budgets-grid">
        <div class="budget-card glass-panel" *ngFor="let b of budgets" [class.border-overbudget]="b.isOverBudget">
          <div class="b-header">
            <div>
              <h3 class="b-category">{{ b.categoryName }}</h3>
              <span class="b-month">October 2026</span>
            </div>
            <span *ngIf="b.isOverBudget" class="badge badge-critical">Exceeded Limit</span>
            <span *ngIf="!b.isOverBudget && (b.percentageUsed || 0) >= (b.alertThresholdPercentage || 80)" class="badge badge-high">Near Ceiling</span>
            <span *ngIf="!b.isOverBudget && (b.percentageUsed || 0) < (b.alertThresholdPercentage || 80)" class="badge badge-normal">On Track</span>
          </div>

          <div class="b-numbers">
            <div class="b-stat">
              <span class="b-lbl">Spent</span>
              <span class="b-val mono-text">{{ b.currentSpent | currency }}</span>
            </div>
            <div class="b-stat text-right">
              <span class="b-lbl">Monthly Cap</span>
              <span class="b-val mono-text">{{ b.monthlyLimit | currency }}</span>
            </div>
          </div>

          <div class="b-meter-wrap">
            <div class="b-meter-track">
              <div class="b-meter-fill"
                [style.width.%]="Math.min(100, b.percentageUsed || 0)"
                [class.bg-rose]="b.isOverBudget"
                [class.bg-amber]="!b.isOverBudget && (b.percentageUsed || 0) >= 80"
                [class.bg-indigo]="!b.isOverBudget && (b.percentageUsed || 0) < 80">
              </div>
            </div>
            <div class="b-meter-labels">
              <span>{{ b.percentageUsed }}% consumed</span>
              <span>Remaining: {{ b.remaining | currency }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .budgets-page {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .page-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: #0f172a !important;
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: #475569;
      margin-top: 4px;
    }
    .budgets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }
    .budget-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: #ffffff !important;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(15, 23, 42, 0.05);
    }
    .border-overbudget {
      border: 2px solid #f43f5e !important;
    }
    .b-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .b-category {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a !important;
    }
    .b-month {
      font-size: 0.8rem;
      color: #64748b;
    }
    .b-numbers {
      display: flex;
      justify-content: space-between;
    }
    .b-lbl {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
    }
    .b-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a !important;
    }
    .text-right {
      text-align: right;
    }
    .b-meter-wrap {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .b-meter-track {
      height: 10px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .b-meter-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    .bg-rose { background: #e11d48; }
    .bg-amber { background: #d97706; }
    .bg-indigo { background: #4f46e5; }
    .b-meter-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 600;
    }
    .mono-text {
      font-family: var(--font-mono);
    }
  `]
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  Math = Math;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getBudgets().subscribe(b => this.budgets = b);
  }
}
