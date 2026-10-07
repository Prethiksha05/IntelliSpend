import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private router: Router) {}

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    // Default demo user so showcase is active immediately without manual login hurdle
    return {
      id: 1,
      username: 'alex_morgan',
      email: 'alex@intellispend.io',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'ROLE_USER',
      currency: 'USD'
    };
  }

  setSession(auth: AuthResponse) {
    localStorage.setItem('token', auth.token);
    const user: User = {
      id: auth.id,
      username: auth.username,
      email: auth.email,
      firstName: auth.firstName,
      lastName: auth.lastName,
      role: auth.role,
      currency: auth.currency
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
