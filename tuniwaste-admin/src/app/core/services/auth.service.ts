import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<any> {
    console.log('AuthService: Attempting login to', `${this.apiUrl}/auth/login`);
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        console.log('AuthService: Login response received', response);
        if (response.token && response.user) {
          if (response.user.role !== 'admin') {
            console.error('AuthService: User is not an admin', response.user.role);
            throw new Error('User is not an admin');
          }
          console.log('AuthService: Storing admin token and user');
          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('admin_user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        } else {
          console.error('AuthService: Invalid login response', response);
          throw new Error('Invalid login response');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user && user.role === 'admin');
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('admin_user');
    
    // Clear mock/invalid tokens
    if (token === 'mock-jwt-token-for-testing') {
      console.warn('AuthService: Found mock token, clearing it');
      this.logout();
      return;
    }
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          console.log('AuthService: Restored admin user from storage', user.email);
          this.currentUserSubject.next(user);
        } else {
          console.warn('AuthService: User in storage is not admin, clearing');
          this.logout();
        }
      } catch (error) {
        console.error('AuthService: Error parsing user from storage', error);
        this.logout();
      }
    }
  }
}
