import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { AnomaliesComponent } from './pages/anomalies/anomalies.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'anomalies', component: AnomaliesComponent },
  { path: 'budgets', component: BudgetsComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'dashboard' }
];
