-- =====================================================================
-- IntelliSpend Database Optimization Indexes
-- =====================================================================

USE intellispend_db;

CREATE INDEX idx_expenses_user_date ON expenses (user_id, expense_date);
CREATE INDEX idx_expenses_user_cat ON expenses (user_id, category_id);
CREATE INDEX idx_expenses_anomaly ON expenses (user_id, is_anomaly);
CREATE INDEX idx_budgets_user_period ON budgets (user_id, year, month);
CREATE INDEX idx_anomalies_user_created ON anomaly_logs (user_id, created_at);
