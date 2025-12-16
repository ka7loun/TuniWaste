import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  pagination: any = {};
  loading = false;
  filters = {
    stage: '',
    search: '',
  };
  currentPage = 1;
  pageSize = 50;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    const filters: any = {};
    if (this.filters.stage) filters.stage = this.filters.stage;
    if (this.filters.search) filters.search = this.filters.search;

    this.adminService.getAllTransactions(this.currentPage, this.pageSize, filters).subscribe({
      next: (response) => {
        this.transactions = (response['transactions'] as any[]) || [];
        this.pagination = response.pagination || {};
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadTransactions();
  }

  clearFilters() {
    this.filters = { stage: '', search: '' };
    this.currentPage = 1;
    this.loadTransactions();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadTransactions();
  }

  getStageBadgeClass(stage: string): string {
    const classes: Record<string, string> = {
      negotiation: 'badge-warning',
      contract: 'badge-info',
      'in-transit': 'badge-primary',
      delivered: 'badge-success',
    };
    return classes[stage] || '';
  }
}
