import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss',
})
export class ListingsComponent implements OnInit {
  listings: any[] = [];
  pagination: any = {};
  loading = false;
  filters = {
    status: '',
    category: '',
    search: '',
  };
  currentPage = 1;
  pageSize = 50;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.loading = true;
    const filters: any = {};
    if (this.filters.status) filters.status = this.filters.status;
    if (this.filters.category) filters.category = this.filters.category;
    if (this.filters.search) filters.search = this.filters.search;

    console.log('ListingsComponent: Loading listings with filters:', filters);

    this.adminService.getAllListings(this.currentPage, this.pageSize, filters).subscribe({
      next: (response) => {
        console.log('ListingsComponent: Received response:', response);
        this.listings = (response['listings'] as any[]) || [];
        this.pagination = response.pagination || {};
        this.loading = false;
      },
      error: (err) => {
        console.error('ListingsComponent: Error loading listings:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
        });
        this.loading = false;
        alert(`Failed to load listings: ${err.error?.message || err.message || 'Unknown error'}`);
      },
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadListings();
  }

  clearFilters() {
    this.filters = { status: '', category: '', search: '' };
    this.currentPage = 1;
    this.loadListings();
  }

  deleteListing(listing: any) {
    if (confirm(`Are you sure you want to delete listing "${listing.title}"?`)) {
      this.adminService.deleteListing(listing._id).subscribe({
        next: () => {
          this.loadListings();
        },
        error: (err) => {
          console.error('Error deleting listing:', err);
          alert(err.error?.message || 'Failed to delete listing');
        },
      });
    }
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadListings();
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      open: 'badge-success',
      reserved: 'badge-warning',
      awarded: 'badge-info',
    };
    return classes[status] || '';
  }
}
