import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Expense, Category } from '../../models/models';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expenses-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Transaction Ledger</h1>
          <p class="page-subtitle">Track, filter, and audit full expenditure records with AI verification tags</p>
        </div>
        <div class="header-actions">
          <button (click)="openAddModal()" class="btn btn-primary">
            <i class="fa-solid fa-plus"></i> Record Transaction
          </button>
        </div>
      </header>

      <!-- Filters Bar -->
      <div class="filters-bar glass-panel">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search merchant, title, or tags..." class="search-input">
        </div>

        <div class="filter-actions">
          <button (click)="filterOnlyAnomalies = !filterOnlyAnomalies" class="btn btn-sm" [class.btn-danger]="filterOnlyAnomalies" [class.btn-secondary]="!filterOnlyAnomalies">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ filterOnlyAnomalies ? 'Showing Anomalies Only' : 'Filter Anomalies' }}
          </button>
        </div>
      </div>

      <!-- Table View -->
      <div class="table-container glass-panel">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Transaction</th>
              <th>Category</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>ML Risk Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tx of filteredExpenses">
              <td class="mono-text">{{ tx.expenseDate }} <span class="time-sub">{{ tx.expenseTime || '12:00' }}</span></td>
              <td>
                <div class="tx-cell-title">
                  <strong>{{ tx.title }}</strong>
                  <span class="tx-cell-desc" *ngIf="tx.description">{{ tx.description }}</span>
                </div>
              </td>
              <td>
                <span class="category-pill" [style.borderColor]="tx.categoryColor">
                  {{ tx.categoryName || 'General' }}
                </span>
              </td>
              <td class="mono-text text-muted">{{ tx.paymentMethod }}</td>
              <td class="mono-text font-bold" [class.text-rose]="tx.isAnomaly">{{ tx.amount | currency }}</td>
              <td>
                <span *ngIf="tx.isAnomaly" class="badge badge-critical" [title]="tx.anomalyReason">
                  <i class="fa-solid fa-triangle-exclamation"></i> {{ tx.anomalySeverity }} ({{ tx.anomalyScore }})
                </span>
                <span *ngIf="!tx.isAnomaly" class="badge badge-normal">
                  <i class="fa-solid fa-check"></i> NORMAL
                </span>
              </td>
              <td>
                <button (click)="deleteTx(tx.id!)" class="btn-icon text-muted hover-danger" title="Delete record">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredExpenses.length === 0">
              <td colspan="7" class="empty-state">No matching transactions found.</td>
            </tr>
          </tbody>
        </table>
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
    </div>
  `,
  styles: [`
    .expenses-page {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
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
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: #94a3b8;
      margin-top: 4px;
    }
    .filters-bar {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 8px 14px;
      width: 360px;
    }
    .search-box i {
      color: #64748b;
    }
    .search-input {
      background: transparent;
      border: none;
      color: #ffffff;
      outline: none;
      width: 100%;
      font-size: 0.9rem;
    }
    .table-container {
      overflow-x: auto;
      padding: 8px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th {
      padding: 14px 16px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .data-table td {
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.9rem;
      color: #f1f5f9;
    }
    .data-table tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .mono-text {
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }
    .time-sub {
      color: #64748b;
      font-size: 0.75rem;
      margin-left: 4px;
    }
    .tx-cell-title {
      display: flex;
      flex-direction: column;
    }
    .tx-cell-desc {
      font-size: 0.78rem;
      color: #64748b;
    }
    .category-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border-left: 3px solid;
    }
    .font-bold {
      font-weight: 700;
    }
    .text-rose {
      color: #fb7185;
    }
    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 6px;
      transition: color 0.2s;
    }
    .hover-danger:hover {
      color: #f43f5e;
    }
    .empty-state {
      text-align: center;
      padding: 40px !important;
      color: #64748b;
    }
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
  `]
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  categories: Category[] = [];
  searchQuery = '';
  filterOnlyAnomalies = false;
  showAddModal = false;
  loading = false;

  newExpense: Expense = {
    title: '',
    amount: 0,
    categoryId: 1,
    expenseDate: new Date().toISOString().substring(0, 10),
    paymentMethod: 'CREDIT_CARD',
    description: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadExpenses();
    this.api.getCategories().subscribe(c => this.categories = c);
  }

  loadExpenses() {
    this.api.getExpenses().subscribe(e => this.expenses = e);
  }

  openAddModal() {
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
      this.loadExpenses();
    });
  }

  get filteredExpenses(): Expense[] {
    return this.expenses.filter(e => {
      const matchSearch = !this.searchQuery ||
        e.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchAnomaly = !this.filterOnlyAnomalies || e.isAnomaly;
      return matchSearch && matchAnomaly;
    });
  }

  deleteTx(id: number) {
    if (confirm('Delete this transaction?')) {
      this.api.deleteExpense(id).subscribe(() => this.loadExpenses());
    }
  }
}
