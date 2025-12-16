import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { DashboardStats, Activity } from '../../core/models/admin.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  activities: Activity[] = [];
  loading = true;
  error: string | null = null;
  Object = Object; // Expose Object for template use

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;
    console.log('DashboardComponent: Loading dashboard data...');
    console.log('DashboardComponent: Token in localStorage:', localStorage.getItem('admin_token') ? 'Present' : 'Missing');
    
    // Set a timeout to show error if request takes too long
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        console.warn('DashboardComponent: Request taking too long, showing timeout message');
        this.error = 'Request is taking too long. Please check if the backend server is running on http://localhost:5000';
        this.loading = false;
      }
    }, 15000); // 15 second timeout
    
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        clearTimeout(timeoutId);
        console.log('DashboardComponent: Received stats:', stats);
        this.stats = stats;
        this.loading = false;
        this.error = null;
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('DashboardComponent: Error loading dashboard:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          name: err.name,
        });
        this.loading = false;
        
        if (err.status === 0 || err.name === 'TimeoutError') {
          this.error = 'Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'Authentication failed. Please log out and log back in.';
        } else {
          this.error = err.error?.message || err.message || 'Failed to load dashboard data. Please check your connection and try again.';
        }
      },
    });

    this.adminService.getActivityTimeline(20, 0).subscribe({
      next: (timeline) => {
        console.log('DashboardComponent: Received activities:', timeline);
        this.activities = timeline.activities;
      },
      error: (err) => {
        console.error('DashboardComponent: Error loading activities:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
        });
      },
    });
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      user_created: 'user',
      listing_created: 'file',
      bid_placed: 'dollar',
      transaction_created: 'briefcase',
      message_sent: 'message',
    };
    return icons[type] || 'circle';
  }

  getActivityLabel(type: string): string {
    const labels: Record<string, string> = {
      user_created: 'User Created',
      listing_created: 'Listing Created',
      bid_placed: 'Bid Placed',
      transaction_created: 'Transaction Created',
      message_sent: 'Message Sent',
    };
    return labels[type] || type;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
