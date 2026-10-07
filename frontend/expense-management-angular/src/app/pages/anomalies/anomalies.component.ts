import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Expense } from '../../models/models';

@Component({
  selector: 'app-anomalies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="anomalies-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Machine Learning Anomaly Center</h1>
          <p class="page-subtitle">Unsupervised Isolation Forest detection & behavioral outlier forensic analysis</p>
        </div>
        <div class="ml-badge-container">
          <span class="badge badge-critical">Active ML Guard</span>
          <span class="badge badge-normal">Scikit-Learn Subsystem</span>
        </div>
      </header>

      <!-- Architecture Explainer Banner -->
      <div class="arch-banner glass-panel">
        <div class="arch-icon">
          <i class="fa-solid fa-network-wired"></i>
        </div>
        <div class="arch-content">
          <h4>Multi-Dimensional Anomaly Pipeline</h4>
          <p>
            Transactions are evaluated using an ensemble approach combining <strong>Isolation Forest</strong> path length metrics,
            <strong>Z-Score velocity</strong> deviations across 30-day temporal windows, and <strong>circadian timing heuristics</strong>.
          </p>
        </div>
      </div>

      <!-- Flagged Anomalies Grid -->
      <div class="anomalies-grid">
        <div class="anomaly-card glass-panel" *ngFor="let item of anomalies">
          <div class="card-top">
            <div class="risk-meter">
              <span class="score-tag">{{ item.anomalyScore }}</span>
              <span class="score-lbl">RISK SCORE</span>
            </div>
            <div class="card-titles">
              <span class="badge badge-critical">{{ item.anomalySeverity }} SEVERITY</span>
              <h3 class="anomaly-title">{{ item.title }}</h3>
              <span class="anomaly-time mono-text">{{ item.expenseDate }} at {{ item.expenseTime || '03:14:00' }}</span>
            </div>
            <div class="card-cost">
              <span class="cost-val mono-text text-rose">{{ item.amount | currency }}</span>
              <span class="cost-cat">{{ item.categoryName }}</span>
            </div>
          </div>

          <div class="forensic-box">
            <div class="forensic-header">
              <i class="fa-solid fa-microscope text-cyan"></i>
              <span>Forensic Diagnostics:</span>
            </div>
            <p class="forensic-text">{{ item.anomalyReason }}</p>
          </div>

          <div class="card-actions">
            <span class="action-caption">Human-in-the-Loop Feedback:</span>
            <div class="action-buttons">
              <button (click)="resolve(item.id!, 'CONFIRMED')" class="btn btn-sm btn-danger">
                <i class="fa-solid fa-triangle-exclamation"></i> Confirm Anomaly
              </button>
              <button (click)="resolve(item.id!, 'FALSE_POSITIVE')" class="btn btn-sm btn-secondary">
                <i class="fa-solid fa-check"></i> Mark Expected
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="anomalies.length === 0" class="empty-anomalies glass-panel">
          <i class="fa-solid fa-shield-check text-emerald"></i>
          <h3>No Active Anomalies Detected</h3>
          <p>All recorded spending matches your verified baseline patterns.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .anomalies-page {
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
      color: #0f172a !important;
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: #475569;
      margin-top: 4px;
    }
    .ml-badge-container {
      display: flex;
      gap: 10px;
    }
    .arch-banner {
      padding: 20px 24px;
      display: flex;
      gap: 20px;
      align-items: center;
      background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%) !important;
      border: 1px solid #bfdbfe !important;
      border-radius: 16px;
    }
    .arch-icon {
      font-size: 2.2rem;
      color: #4f46e5;
    }
    .arch-content h4 {
      color: #1e3a8a !important;
      margin-bottom: 4px;
      font-size: 1.05rem;
      font-weight: 800;
    }
    .arch-content p {
      font-size: 0.88rem;
      color: #334155;
      line-height: 1.5;
    }
    .anomalies-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .anomaly-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #ffffff !important;
      border: 1px solid #e2e8f0;
      border-left: 5px solid #e11d48 !important;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(15, 23, 42, 0.05);
    }
    .card-top {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .risk-meter {
      width: 72px;
      height: 72px;
      border-radius: 14px;
      background: #ffe4e6;
      border: 1px solid #fecdd3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .score-tag {
      font-size: 1.15rem;
      font-weight: 800;
      color: #e11d48;
      font-family: var(--font-mono);
    }
    .score-lbl {
      font-size: 0.58rem;
      font-weight: 800;
      color: #9f1239;
      letter-spacing: 0.05em;
    }
    .card-titles {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .anomaly-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a !important;
    }
    .anomaly-time {
      font-size: 0.8rem;
      color: #64748b;
    }
    .card-cost {
      text-align: right;
      display: flex;
      flex-direction: column;
    }
    .cost-val {
      font-size: 1.5rem;
      font-weight: 800;
    }
    .cost-cat {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
    }
    .forensic-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
    }
    .forensic-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      color: #0284c7;
      margin-bottom: 6px;
    }
    .forensic-text {
      color: #1e293b;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }
    .action-caption {
      font-size: 0.82rem;
      color: #64748b;
      font-weight: 600;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    .mono-text {
      font-family: var(--font-mono);
    }
    .text-rose {
      color: #e11d48;
    }
    .text-cyan {
      color: #0284c7;
    }
    .empty-anomalies {
      text-align: center;
      padding: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
    }
    .empty-anomalies i {
      font-size: 3rem;
    }
    .empty-anomalies h3 {
      color: #0f172a;
    }
    .empty-anomalies p {
      color: #64748b;
      font-size: 0.9rem;
    }
  `]
})
export class AnomaliesComponent implements OnInit {
  anomalies: Expense[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAnomalies();
  }

  loadAnomalies() {
    this.api.getAnomalies().subscribe(a => this.anomalies = a);
  }

  resolve(id: number, feedback: string) {
    this.api.submitAnomalyFeedback(id, feedback).subscribe(() => {
      this.anomalies = this.anomalies.filter(item => item.id !== id);
    });
  }
}
