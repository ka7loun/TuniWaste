import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { AuthService, AuthUser } from '../../../../core/services/auth.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { Transaction } from '../../../../core/models/transaction.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { MessagingService } from '../../../../core/services/messaging.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, SectionHeadingComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  readonly user$: Observable<AuthUser | null>;
  readonly transactions$: Observable<Transaction[]>;
  readonly activeTransactions$: Observable<Transaction[]>;
  readonly completedTransactions$: Observable<Transaction[]>;

  constructor(
    private readonly authService: AuthService,
    private readonly transactionService: TransactionService,
    private readonly messagingService: MessagingService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    this.user$ = this.authService.user$;
    this.transactions$ = this.transactionService.transactions$;

    this.activeTransactions$ = this.transactions$.pipe(
      map((transactions) =>
        transactions.filter((t) => t.stage !== 'delivered')
      )
    );

    this.completedTransactions$ = this.transactions$.pipe(
      map((transactions) =>
        transactions.filter((t) => t.stage === 'delivered')
      )
    );
  }

  ngOnInit(): void {
    // Reload transactions
    this.transactionService.loadTransactions();
  }

  getStageLabel(stage: Transaction['stage']): string {
    const labels: Record<Transaction['stage'], string> = {
      negotiation: 'Negotiation',
      'in-transit': 'In Transit',
      delivered: 'Delivered',
    };
    return labels[stage] || stage;
  }

  getNextStage(currentStage: Transaction['stage']): Transaction['stage'] | null {
    const stages: Transaction['stage'][] = ['negotiation', 'in-transit', 'delivered'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  }

  updateStage(transaction: Transaction): void {
    const nextStage = this.getNextStage(transaction.stage);
    if (!nextStage) return;

    this.transactionService.updateStage(transaction.id, nextStage).subscribe({
      next: () => {
        this.toastService.show(`Transaction moved to ${this.getStageLabel(nextStage)}`, 'success');
        (this.transactionService as any).loadTransactions();
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Failed to update transaction stage';
        this.toastService.show(errorMessage, 'error');
      },
    });
  }

  messageCounterparty(transaction: Transaction): void {
    // Find or create thread with counterparty
    const user = this.authService.snapshot();
    if (!user) return;

    // Navigate to messaging with a filter/search for the counterparty
    this.router.navigate(['/messaging'], {
      queryParams: { counterparty: transaction.counterparty },
    });
  }

  viewDetails(transaction: Transaction): void {
    this.router.navigate(['/transactions', transaction.id]);
  }
}

