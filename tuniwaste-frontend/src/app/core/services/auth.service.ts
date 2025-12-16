import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { USER_ROLES, UserRole } from '../models/user-role.type';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  company: string;
  contact: string;
  email: string;
  role: UserRole;
  verified: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  company: string;
  contact: string;
  role: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    company: string;
    contact: string;
    role: UserRole;
    verified: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly user$ = this.userSubject.asObservable();
  private readonly tokenKey = 'tuniwaste_token';
  private readonly sessionRestoredSubject = new BehaviorSubject<boolean>(false);
  readonly sessionRestored$ = this.sessionRestoredSubject.asObservable();

  constructor(private http: HttpClient) {
    // Try to restore user from token on service init
    this.restoreSession();
  }

  login(email: string, password: string, _role?: UserRole): Observable<AuthUser> {
    const payload: LoginRequest = { email, password };
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((response) => {
        this.setToken(response.token);
        const user: AuthUser = {
          id: response.user.id,
          email: response.user.email,
          company: response.user.company,
          contact: response.user.contact,
          role: response.user.role,
          verified: response.user.verified,
        };
        this.userSubject.next(user);
      }),
      map((response): AuthUser => ({
        id: response.user.id,
        email: response.user.email,
        company: response.user.company,
        contact: response.user.contact,
        role: response.user.role,
        verified: response.user.verified,
      })),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error.error?.message || 'Login failed');
      })
    );
  }

  register(payload: Omit<AuthUser, 'id' | 'verified'> & { password: string }): Observable<AuthUser> {
    const request: RegisterRequest = {
      email: payload.email,
      password: payload.password,
      company: payload.company,
      contact: payload.contact,
      role: payload.role,
    };

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request).pipe(
      tap((response) => {
        this.setToken(response.token);
        const user: AuthUser = {
          id: response.user.id,
          email: response.user.email,
          company: response.user.company,
          contact: response.user.contact,
          role: response.user.role,
          verified: response.user.verified,
        };
        this.userSubject.next(user);
      }),
      map((response): AuthUser => ({
        id: response.user.id,
        email: response.user.email,
        company: response.user.company,
        contact: response.user.contact,
        role: response.user.role,
        verified: response.user.verified,
      })),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => error.error?.message || 'Registration failed');
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }

  markVerified(): void {
    if (this.userSubject.value) {
      this.userSubject.next({ ...this.userSubject.value, verified: true });
    }
  }

  roleLabel(role: UserRole): string {
    if (role === 'admin') {
      return 'Administrator';
    }
    return USER_ROLES[role];
  }

  isLoggedIn$(): Observable<boolean> {
    return this.user$.pipe(map(Boolean));
  }

  snapshot(): AuthUser | null {
    return this.userSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  submitKYC(kycData: {
    company: {
      legalName: string;
      registrationNumber: string;
      taxId: string;
      industry: string;
      hqCity: string;
    };
    compliance: {
      handlesHazmat: boolean;
      annualWaste: string;
      certifications: string[];
    };
    contacts: {
      complianceOfficer: string;
      phone: string;
      email: string;
    };
    documents: string[];
  }): Observable<AuthUser> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => 'User not logged in');
    }

    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/kyc`,
        { kyc: kycData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .pipe(
        tap((response) => {
          const updatedUser: AuthUser = {
            id: response.user.id,
            email: response.user.email,
            company: response.user.company,
            contact: response.user.contact,
            role: response.user.role,
            verified: response.user.verified,
          };
          this.userSubject.next(updatedUser);
        }),
        map((response): AuthUser => ({
          id: response.user.id,
          email: response.user.email,
          company: response.user.company,
          contact: response.user.contact,
          role: response.user.role,
          verified: response.user.verified,
        })),
        catchError((error) => {
          console.error('KYC submission error:', error);
          return throwError(() => error.error?.message || 'KYC submission failed');
        })
      );
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (token) {
      // Fetch user details from backend to restore session
      this.http
        .get<{ user: AuthResponse['user'] }>(`${environment.apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .pipe(
          catchError((error) => {
            // Only clear token if it's a real auth error (401/403)
            // Don't clear on network errors - token might still be valid
            if (error.status === 401 || error.status === 403) {
              // Token is invalid or expired, clear it
              localStorage.removeItem(this.tokenKey);
              // Clear user state
              this.userSubject.next(null);
            }
            // Mark session restoration as complete even on error
            this.sessionRestoredSubject.next(true);
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response?.user) {
            const user: AuthUser = {
              id: response.user.id,
              email: response.user.email,
              company: response.user.company,
              contact: response.user.contact,
              role: response.user.role,
              verified: response.user.verified,
            };
            this.userSubject.next(user);
          }
          // Mark session restoration as complete
          this.sessionRestoredSubject.next(true);
        });
    } else {
      // No token, mark as restored immediately
      this.sessionRestoredSubject.next(true);
    }
  }
}
