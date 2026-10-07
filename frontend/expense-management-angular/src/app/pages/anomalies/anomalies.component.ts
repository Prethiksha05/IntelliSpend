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
      color: #ffffff;
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: #94a3b8;
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
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .arch-icon {
      font-size: 2.2rem;
      color: #818cf8;
    }
    .arch-content h4 {
      color: #ffffff;
      margin-bottom: 4px;
      font-size: 1rem;
    }
    .arch-content p {
      font-size: 0.85rem;
      color: #94a3b8;
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
      border-left: 4px solid #f43f5e;
    }
    .card-top {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .risk-meter {
      width: 70px;
      height: 70px;
      border-radius: 14px;
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .score-tag {
      font-size: 1.15rem;
      font-weight: 800;
      color: #fb7185;
      font-family: var(--font-mono);
    }
    .score-lbl {
      font-size: 0.55rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.05em;
    }
    .card-titles {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .anomaly-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #ffffff;
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
      color: #94a3b8;
    }
    .forensic-box {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 14px 18px;
    }
    .forensic-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 6px;
    }
    .forensic-text {
      color: #e2e8f0;
      font-size: 0.88rem;
      line-height: 1.45;
    }
    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .action-caption {
      font-size: 0.82rem;
      color: #64748b;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    .mono-text {
      font-family: var(--font-mono);
    }
    .text-rose {
      color: #fb7185;
    }
    .text-cyan {
      color: #38bdf8;
    }
    .empty-anomalies {
      text-align: center;
      padding: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .empty-anomalies i {
      font-size: 3rem;
    }
    .empty-anomalies h3 {
      color: #ffffff;
    }
    .empty-anomalies p {
      color: #94a3b8;
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
