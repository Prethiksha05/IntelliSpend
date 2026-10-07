# 🚀 IntelliSpend — 15-Minute Showcase Presentation Cheat Sheet

Welcome to your **IntelliSpend** live showcase! Follow this exact sequence to present a production-grade full-stack demo with zero setup friction.

---

## ⚡ 1. How to Launch (1 Click)

Double click the included launcher or run in terminal:
```bash
./start-intellispend.bat
```
*(Or in PowerShell: `./start-intellispend.ps1`)*

* **Frontend UI**: [http://localhost:4200](http://localhost:4200)
* **Backend Swagger API**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:intellispend_db`, User: `sa`, Password: empty)

---

## 🔑 2. Instant Demo Login
* **Username**: `alex_morgan`
* **Password**: `Password123!`
* Or simply click **"Launch Showcase"** on the login page for instantaneous 1-click access.

---

## 🎯 3. Five-Step Live Demo Script

### Step 1: The Executive Dashboard (First Impression)
* **What to Show**:
  * Point out the dark-mode glassmorphic aesthetics, glowing KPI telemetry cards (*Total Spend*, *Budget Consumption Gauge*, *ML Anomalies*).
  * Show the top **Critical Anomaly Alert Banner** warning about a suspicious luxury watch purchase.
  * Show the real-time **Category Allocation** meters and recent transaction ledger with anomaly tags.

### Step 2: The ML Anomaly Forensic Center (The "WOW" Factor)
* Navigate to **"ML Anomalies"** in the sidebar.
* **Talking Points**:
  * Explain the **Isolation Forest** unsupervised algorithm and Z-score deviation model.
  * Show the **Risk Score (0.9650)** on the *$4,250.00 Rolex Boutique* transaction.
  * Show the forensic rationale: *"Extreme price deviation (>12x median) and high-risk hour (03:14 AM)"*.
  * Click **"Confirm Anomaly"** or **"Mark Expected"** to demonstrate **Human-in-the-Loop Active Retraining**.

### Step 3: Real-Time Anomaly Detection on Live Input
* Return to Dashboard or Transactions.
* Click **"+ Record Transaction"**.
* Enter a high-value purchase:
  * **Title**: `Apple MacBook Pro Max Cluster`
  * **Amount**: `4500`
  * **Category**: `Shopping & Luxury`
* Submit and watch the system instantly evaluate, assign an outlier score, and highlight it with a red pulsing anomaly badge!

### Step 4: Budget Ceiling & Overspending Alerts
* Navigate to **"Budgets & Goals"**.
* Show how each category has dynamic consumption tracking:
  * *Shopping & Luxury*: Shows a red **"Exceeded Limit"** badge with consumption exceeding 100%.
  * *Transportation* and *Food*: Shows green **"On Track"** status with remaining balances.

### Step 5: Full Architectural Stack Recap
* Point out that the platform uses:
  * **Frontend**: Standalone Angular with modern signals, TypeScript, and custom CSS design system.
  * **Backend**: Spring Boot 3.4, Spring Security 6, JWT, JPA / Hibernate, RESTful APIs.
  * **AI / ML**: Isolation Forest unsupervised anomaly detection with multi-parameter statistical scoring.
  * **100% Free & Open Source**: No cloud API tokens, no paid subscriptions, completely portable.

---
**Done! Ready for your demo!**
