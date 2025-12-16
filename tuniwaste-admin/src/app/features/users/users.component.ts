import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user.model';
import { PaginatedResponse } from '../../core/models/admin.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  pagination: any = {};
  loading = false;
  filters = {
    role: '',
    verified: '',
    search: '',
  };
  currentPage = 1;
  pageSize = 50;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    const filters: any = {};
    if (this.filters.role) filters.role = this.filters.role;
    if (this.filters.verified !== '') filters.verified = this.filters.verified === 'true';

    console.log('UsersComponent: Loading users with filters:', filters);
    
    this.adminService.getAllUsers(this.currentPage, this.pageSize, filters).subscribe({
      next: (response) => {
        console.log('UsersComponent: Received response:', response);
        this.users = (response['users'] as User[]) || [];
        this.pagination = response.pagination || {};
        this.loading = false;
      },
      error: (err) => {
        console.error('UsersComponent: Error loading users:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
        });
        this.loading = false;
        alert(`Failed to load users: ${err.error?.message || err.message || 'Unknown error'}`);
      },
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters() {
    this.filters = { role: '', verified: '', search: '' };
    this.currentPage = 1;
    this.loadUsers();
  }

  toggleVerification(user: User) {
    this.adminService.updateUser(user._id, { verified: !user.verified }).subscribe({
      next: () => {
        user.verified = !user.verified;
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('Failed to update user');
      },
    });
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
      this.adminService.deleteUser(user._id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert(err.error?.message || 'Failed to delete user');
        },
      });
    }
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      generator: 'badge-generator',
      buyer: 'badge-buyer',
      admin: 'badge-admin',
    };
    return classes[role] || '';
  }
}
