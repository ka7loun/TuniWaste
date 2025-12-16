import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, ActivityTimeline, PaginatedResponse } from '../models/admin.model';
import { User, UserStats } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.error('AdminService: Admin token not found in localStorage');
      return {};
    }
    console.log('AdminService: Token found, length:', token.length);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  getDashboardStats(): Observable<DashboardStats> {
    const url = `${this.apiUrl}/admin/dashboard/stats`;
    const headers = this.getHeaders();
    console.log('AdminService: Fetching dashboard stats from', url);
    console.log('AdminService: Headers:', headers);
    return this.http.get<DashboardStats>(url, {
      headers: headers,
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError((error: any) => {
        console.error('AdminService: getDashboardStats error:', error);
        if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
          console.error('AdminService: Request timed out after 10 seconds');
          return throwError(() => new Error('Request timed out. Please check if the backend is running.'));
        }
        return throwError(() => error);
      })
    );
  }

  getActivityTimeline(limit = 50, offset = 0): Observable<ActivityTimeline> {
    const params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());
    return this.http.get<ActivityTimeline>(`${this.apiUrl}/admin/dashboard/activity`, {
      headers: this.getHeaders(),
      params,
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError((error: HttpErrorResponse) => {
        console.error('AdminService: getActivityTimeline error:', error);
        return throwError(() => error);
      })
    );
  }

  getAnalytics(months = 12): Observable<any> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard/analytics`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getAllUsers(page = 1, limit = 50, filters?: any): Observable<PaginatedResponse<User>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (filters?.role) params = params.set('role', filters.role);
    if (filters?.verified !== undefined) params = params.set('verified', filters.verified);
    if (filters?.search) params = params.set('search', filters.search);

    const url = `${this.apiUrl}/admin/users`;
    console.log('AdminService: Fetching users from', url, 'with params', params.toString());
    return this.http.get<PaginatedResponse<User>>(url, {
      headers: this.getHeaders(),
      params,
    });
  }

  getUserById(id: string): Observable<{ user: User; stats: UserStats; listings: any[]; bids: any[]; transactions: any[] }> {
    return this.http.get<any>(`${this.apiUrl}/admin/users/${id}`, {
      headers: this.getHeaders(),
    });
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/users/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/users/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getAllListings(page = 1, limit = 50, filters?: any): Observable<PaginatedResponse<any>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);

    const url = `${this.apiUrl}/admin/listings`;
    console.log('AdminService: Fetching listings from', url, 'with params', params.toString());
    return this.http.get<PaginatedResponse<any>>(url, {
      headers: this.getHeaders(),
      params,
    });
  }

  deleteListing(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/listings/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getAllTransactions(page = 1, limit = 50, filters?: any): Observable<PaginatedResponse<any>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (filters?.stage) params = params.set('stage', filters.stage);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/admin/transactions`, {
      headers: this.getHeaders(),
      params,
    });
  }
}
