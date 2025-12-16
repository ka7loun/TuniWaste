import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalListings: number;
    totalBids: number;
    totalTransactions: number;
    totalMessages: number;
    totalNotifications: number;
    verifiedUsers: number;
    activeListings: number;
    completedTransactions: number;
    totalWasteDiverted: number;
    totalTransactionValue: number;
  };
  today: {
    users: number;
    listings: number;
    bids: number;
    transactions: number;
    messages: number;
  };
  thisWeek: {
    users: number;
    listings: number;
    bids: number;
    transactions: number;
  };
  thisMonth: {
    users: number;
    listings: number;
    bids: number;
    transactions: number;
  };
  distributions: {
    users: {
      generators: number;
      buyers: number;
      admins: number;
    };
    listings: {
      open: number;
      reserved: number;
      awarded: number;
    };
    transactions: {
      negotiation: number;
      contract: number;
      inTransit: number;
      delivered: number;
    };
    bids: {
      pending: number;
      accepted: number;
      declined: number;
    };
  };
}

export interface ActivityItem {
  type: string;
  timestamp: Date;
  data: any;
}

export interface ActivityTimeline {
  activities: ActivityItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface Analytics {
  userGrowth: Array<{ _id: { year: number; month: number }; count: number }>;
  listingGrowth: Array<{ _id: { year: number; month: number }; count: number }>;
  transactionValue: Array<{ _id: { year: number; month: number }; totalValue: number; count: number }>;
  categoryDistribution: Array<{ _id: string; count: number; totalQuantity: number }>;
  topSellers: Array<{ email: string; company: string; listingCount: number; totalQuantity: number }>;
  topBuyers: Array<{ email: string; company: string; transactionCount: number; totalValue: number }>;
}

export interface AdminUser {
  _id: string;
  email: string;
  company: string;
  contact: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

export interface AdminListing {
  _id: string;
  title: string;
  material: string;
  category: string;
  quantityTons: number;
  status: string;
  seller: { email: string; company: string } | string;
  createdAt: string;
}

export interface AdminTransaction {
  _id: string;
  value: number;
  stage: string;
  seller: { email: string; company: string } | string;
  buyer: { email: string; company: string } | string;
  listingId: { title: string; category: string } | string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${environment.apiUrl}/admin/dashboard/stats`,
      this.getAuthHeaders()
    );
  }

  getActivityTimeline(limit = 50, offset = 0): Observable<ActivityTimeline> {
    return this.http.get<ActivityTimeline>(
      `${environment.apiUrl}/admin/dashboard/activity?limit=${limit}&offset=${offset}`,
      this.getAuthHeaders()
    );
  }

  getAnalytics(months = 12): Observable<Analytics> {
    return this.http.get<Analytics>(
      `${environment.apiUrl}/admin/dashboard/analytics?months=${months}`,
      this.getAuthHeaders()
    );
  }

  getAllUsers(page = 1, limit = 50, filters?: { role?: string; verified?: boolean; search?: string }): Observable<{ users: AdminUser[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    let url = `${environment.apiUrl}/admin/users?page=${page}&limit=${limit}`;
    if (filters?.role) url += `&role=${filters.role}`;
    if (filters?.verified !== undefined) url += `&verified=${filters.verified}`;
    if (filters?.search) url += `&search=${encodeURIComponent(filters.search)}`;
    
    return this.http.get<{ users: AdminUser[]; pagination: any }>(url, this.getAuthHeaders());
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/users/${id}`, this.getAuthHeaders());
  }

  updateUser(id: string, data: { verified?: boolean; role?: string; company?: string; contact?: string }): Observable<AdminUser> {
    return this.http.put<AdminUser>(
      `${environment.apiUrl}/admin/users/${id}`,
      data,
      this.getAuthHeaders()
    );
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/admin/users/${id}`,
      this.getAuthHeaders()
    );
  }

  getAllListings(page = 1, limit = 50, filters?: { status?: string; category?: string; search?: string }): Observable<{ listings: AdminListing[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    let url = `${environment.apiUrl}/admin/listings?page=${page}&limit=${limit}`;
    if (filters?.status) url += `&status=${filters.status}`;
    if (filters?.category) url += `&category=${filters.category}`;
    if (filters?.search) url += `&search=${encodeURIComponent(filters.search)}`;
    
    return this.http.get<{ listings: AdminListing[]; pagination: any }>(url, this.getAuthHeaders());
  }

  deleteListing(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/admin/listings/${id}`,
      this.getAuthHeaders()
    );
  }

  getAllTransactions(page = 1, limit = 50, filters?: { stage?: string; search?: string }): Observable<{ transactions: AdminTransaction[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    let url = `${environment.apiUrl}/admin/transactions?page=${page}&limit=${limit}`;
    if (filters?.stage) url += `&stage=${filters.stage}`;
    if (filters?.search) url += `&search=${encodeURIComponent(filters.search)}`;
    
    return this.http.get<{ transactions: AdminTransaction[]; pagination: any }>(url, this.getAuthHeaders());
  }
}

