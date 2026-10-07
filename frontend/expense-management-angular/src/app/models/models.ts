export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  currency: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  currency: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  colorCode: string;
  icon: string;
  isSystemDefault?: boolean;
}

export interface Expense {
  id?: number;
  categoryId: number;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  amount: number;
  expenseDate: string;
  expenseTime?: string;
  title: string;
  description?: string;
  paymentMethod?: string;
  merchant?: string;
  location?: string;
  isAnomaly?: boolean;
  anomalyScore?: number;
  anomalyReason?: string;
  anomalySeverity?: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  receiptUrl?: string;
  isRecurring?: boolean;
  status?: string;
  createdAt?: string;
}

export interface Budget {
  id?: number;
  categoryId?: number;
  categoryName?: string;
  monthlyLimit: number;
  currentSpent?: number;
  remaining?: number;
  percentageUsed?: number;
  month: number;
  year: number;
  alertThresholdPercentage?: number;
  isOverBudget?: boolean;
}

export interface DashboardSummary {
  totalSpentThisMonth: number;
  monthlyBudgetLimit: number;
  budgetRemaining: number;
  budgetUsagePercentage: number;
  totalTransactions: number;
  anomalyCount: number;
  highestExpenseAmount: number;
  topSpendingCategory: string;
  categoryBreakdowns: Array<{
    category: string;
    amount: number;
    percentage: number;
    colorCode: string;
  }>;
  recentDailySpending: Array<{
    date: string;
    amount: number;
  }>;
  recentAnomalies: Expense[];
  recentTransactions: Expense[];
}

export interface AnomalyLog {
  id: number;
  expense: Expense;
  anomalyType: string;
  score: number;
  severity: string;
  explanation: string;
  userFeedback: string;
  createdAt: string;
}
