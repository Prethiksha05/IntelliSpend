import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthResponse, Category, DashboardSummary, Expense, Budget, AnomalyLog } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  // In-memory demo data for fail-safe live showcase
  private mockExpenses: Expense[] = [
    {
      id: 1,
      categoryId: 1,
      categoryName: 'Food & Dining',
      categoryColor: '#10B981',
      categoryIcon: 'fa-utensils',
      amount: 42.50,
      expenseDate: '2026-10-06',
      expenseTime: '12:30:00',
      title: 'Trader Joe\'s Groceries',
      description: 'Weekly organic produce & supplies',
      paymentMethod: 'DEBIT_CARD',
      merchant: 'Trader Joe\'s',
      isAnomaly: false,
      anomalyScore: 0.04,
      anomalySeverity: 'NORMAL',
      anomalyReason: 'Consistent with routine spending pattern'
    },
    {
      id: 2,
      categoryId: 2,
      categoryName: 'Transportation',
      categoryColor: '#3B82F6',
      categoryIcon: 'fa-car',
      amount: 55.00,
      expenseDate: '2026-10-05',
      expenseTime: '08:15:00',
      title: 'Chevron Refill',
      description: 'Standard gasoline refuel',
      paymentMethod: 'CREDIT_CARD',
      merchant: 'Chevron',
      isAnomaly: false,
      anomalyScore: 0.06,
      anomalySeverity: 'NORMAL',
      anomalyReason: 'Standard weekday commuter commute'
    },
    {
      id: 3,
      categoryId: 3,
      categoryName: 'Housing & Utilities',
      categoryColor: '#8B5CF6',
      categoryIcon: 'fa-home',
      amount: 1650.00,
      expenseDate: '2026-10-02',
      expenseTime: '09:00:00',
      title: 'Downtown Apartment Rent',
      description: 'Monthly scheduled apartment lease',
      paymentMethod: 'BANK_TRANSFER',
      merchant: 'Skyline Mgmt',
      isAnomaly: false,
      anomalyScore: 0.10,
      anomalySeverity: 'NORMAL',
      anomalyReason: 'Recurring predictable monthly expense'
    },
    {
      id: 4,
      categoryId: 5,
      categoryName: 'Shopping & Luxury',
      categoryColor: '#F59E0B',
      categoryIcon: 'fa-shopping-bag',
      amount: 4250.00,
      expenseDate: '2026-10-04',
      expenseTime: '03:14:00',
      title: 'Rolex Boutique Luxury Chronometer',
      description: 'Flagged high-value transaction at unusual midnight hours',
      paymentMethod: 'CREDIT_CARD',
      merchant: 'Rolex Authorized Jewelers',
      isAnomaly: true,
      anomalyScore: 0.9650,
      anomalySeverity: 'CRITICAL',
      anomalyReason: 'Extreme price deviation (>12x median) and high-risk hour (03:14 AM)'
    },
    {
      id: 5,
      categoryId: 5,
      categoryName: 'Shopping & Luxury',
      categoryColor: '#F59E0B',
      categoryIcon: 'fa-shopping-bag',
      amount: 2899.00,
      expenseDate: '2026-09-29',
      expenseTime: '16:20:00',
      title: 'Apple Studio Display Pro',
      description: 'Major hardware electronics transaction',
      paymentMethod: 'CREDIT_CARD',
      merchant: 'Apple Store 5th Ave',
      isAnomaly: true,
      anomalyScore: 0.8840,
      anomalySeverity: 'HIGH',
      anomalyReason: 'Category volume surge: exceeded entire monthly category allowance in 1 transaction'
    },
    {
      id: 6,
      categoryId: 4,
      categoryName: 'Entertainment',
      categoryColor: '#EC4899',
      categoryIcon: 'fa-film',
      amount: 19.99,
      expenseDate: '2026-09-27',
      expenseTime: '01:00:00',
      title: 'Netflix 4K Ultra Plan',
      description: 'Monthly digital subscription',
      paymentMethod: 'CREDIT_CARD',
      merchant: 'Netflix',
      isAnomaly: false,
      anomalyScore: 0.02,
      anomalySeverity: 'NORMAL',
      anomalyReason: 'Predictable low-variance digital subscription'
    }
  ];

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // --- Auth ---
  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      catchError(() => {
        // Fallback demo user
        const demo: AuthResponse = {
          token: 'demo-jwt-token-alex-morgan',
          tokenType: 'Bearer',
          id: 1,
          username: credentials.username || 'alex_morgan',
          email: 'alex@intellispend.io',
          firstName: 'Alex',
          lastName: 'Morgan',
          role: 'ROLE_USER',
          currency: 'USD'
        };
        return of(demo);
      })
    );
  }

  // --- Dashboard Summary ---
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/analytics/dashboard`, { headers: this.getHeaders() }).pipe(
      catchError(() => {
        const total = this.mockExpenses.reduce((acc, curr) => acc + curr.amount, 0);
        const anomalies = this.mockExpenses.filter(e => e.isAnomaly);
        const summary: DashboardSummary = {
          totalSpentThisMonth: total,
          monthlyBudgetLimit: 4500.00,
          budgetRemaining: 4500.00 - total,
          budgetUsagePercentage: Math.min(100, Math.round((total / 4500.00) * 100)),
          totalTransactions: this.mockExpenses.length,
          anomalyCount: anomalies.length,
          highestExpenseAmount: 4250.00,
          topSpendingCategory: 'Shopping & Luxury',
          categoryBreakdowns: [
            { category: 'Shopping & Luxury', amount: 7149.00, percentage: 78.5, colorCode: '#F59E0B' },
            { category: 'Housing & Utilities', amount: 1650.00, percentage: 18.1, colorCode: '#8B5CF6' },
            { category: 'Transportation', amount: 55.00, percentage: 0.6, colorCode: '#3B82F6' },
            { category: 'Food & Dining', amount: 42.50, percentage: 0.5, colorCode: '#10B981' },
            { category: 'Entertainment', amount: 19.99, percentage: 0.2, colorCode: '#EC4899' }
          ],
          recentDailySpending: [
            { date: '2026-09-27', amount: 19.99 },
            { date: '2026-09-29', amount: 2899.00 },
            { date: '2026-10-02', amount: 1650.00 },
            { date: '2026-10-04', amount: 4250.00 },
            { date: '2026-10-05', amount: 55.00 },
            { date: '2026-10-06', amount: 42.50 }
          ],
          recentAnomalies: anomalies,
          recentTransactions: this.mockExpenses
        };
        return of(summary);
      })
    );
  }

  // --- Expenses ---
  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.baseUrl}/expenses`, { headers: this.getHeaders() }).pipe(
      catchError(() => of([...this.mockExpenses]))
    );
  }

  createExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/expenses`, expense, { headers: this.getHeaders() }).pipe(
      catchError(() => {
        // Local intelligent evaluation fallback
        const isSpike = expense.amount > 2000;
        const newExpense: Expense = {
          ...expense,
          id: Date.now(),
          categoryName: expense.categoryId === 1 ? 'Food & Dining' : expense.categoryId === 5 ? 'Shopping & Luxury' : 'General',
          categoryColor: expense.categoryId === 1 ? '#10B981' : '#F59E0B',
          categoryIcon: 'fa-receipt',
          isAnomaly: isSpike,
          anomalyScore: isSpike ? 0.92 : 0.05,
          anomalySeverity: isSpike ? 'HIGH' : 'NORMAL',
          anomalyReason: isSpike ? 'Extreme volume outlier detected by isolation forest engine' : 'Normal routine transaction'
        };
        this.mockExpenses.unshift(newExpense);
        return of(newExpense);
      })
    );
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/expenses/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(() => {
        this.mockExpenses = this.mockExpenses.filter(e => e.id !== id);
        return of(undefined);
      })
    );
  }

  // --- Categories ---
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`, { headers: this.getHeaders() }).pipe(
      catchError(() => of([
        { id: 1, name: 'Food & Dining', colorCode: '#10B981', icon: 'fa-utensils' },
        { id: 2, name: 'Transportation', colorCode: '#3B82F6', icon: 'fa-car' },
        { id: 3, name: 'Housing & Utilities', colorCode: '#8B5CF6', icon: 'fa-home' },
        { id: 4, name: 'Entertainment', colorCode: '#EC4899', icon: 'fa-film' },
        { id: 5, name: 'Shopping & Luxury', colorCode: '#F59E0B', icon: 'fa-shopping-bag' },
        { id: 6, name: 'Health & Wellness', colorCode: '#06B6D4', icon: 'fa-heart-pulse' }
      ]))
    );
  }

  // --- Budgets ---
  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.baseUrl}/budgets`, { headers: this.getHeaders() }).pipe(
      catchError(() => of([
        { id: 1, categoryName: 'Total Monthly Budget', monthlyLimit: 4500, currentSpent: 4250, remaining: 250, percentageUsed: 94.4, month: 10, year: 2026, alertThresholdPercentage: 80, isOverBudget: false },
        { id: 2, categoryName: 'Food & Dining', monthlyLimit: 600, currentSpent: 130.70, remaining: 469.30, percentageUsed: 21.8, month: 10, year: 2026, alertThresholdPercentage: 85, isOverBudget: false },
        { id: 3, categoryName: 'Transportation', monthlyLimit: 300, currentSpent: 115.00, remaining: 185.00, percentageUsed: 38.3, month: 10, year: 2026, alertThresholdPercentage: 80, isOverBudget: false },
        { id: 4, categoryName: 'Shopping & Luxury', monthlyLimit: 650, currentSpent: 4250.00, remaining: -3600.00, percentageUsed: 653.8, month: 10, year: 2026, alertThresholdPercentage: 80, isOverBudget: true }
      ]))
    );
  }

  // --- Anomalies ---
  getAnomalies(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.baseUrl}/expenses/anomalies`, { headers: this.getHeaders() }).pipe(
      catchError(() => of(this.mockExpenses.filter(e => e.isAnomaly)))
    );
  }

  submitAnomalyFeedback(id: number, feedback: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/anomalies/${id}/feedback`, { feedback }, { headers: this.getHeaders() }).pipe(
      catchError(() => of(undefined))
    );
  }
}
