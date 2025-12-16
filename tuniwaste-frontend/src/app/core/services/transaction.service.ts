import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

interface BackendTransaction {
  id: string;
  listingTitle: string;
  counterparty: string;
  value: number;
  stage: 'negotiation' | 'in-transit' | 'delivered';
  updatedAt: string;
  documents: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  readonly transactions$ = this.transactionsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadTransactions();
  }

  loadTransactions(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.http
      .get<BackendTransaction[]>(`${environment.apiUrl}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((transactions) =>
          transactions.map((t) => ({
            id: t.id,
            listingTitle: t.listingTitle,
            counterparty: t.counterparty,
            value: t.value,
            stage: t.stage,
            updatedAt: t.updatedAt,
            documents: t.documents,
          }))
        ),
        tap((transactions) => this.transactionsSubject.next(transactions)),
        catchError((error) => {
          console.error('Load transactions error:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  updateStage(id: string, stage: Transaction['stage']): Observable<Transaction> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Not authenticated');
    }

    return this.http
      .put<BackendTransaction>(
        `${environment.apiUrl}/transactions/${id}/stage`,
        { stage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(
        map((transaction) => {
          const transformed: Transaction = {
            id: transaction.id,
            listingTitle: transaction.listingTitle,
            counterparty: transaction.counterparty,
            value: transaction.value,
            stage: transaction.stage,
            updatedAt: transaction.updatedAt,
            documents: transaction.documents,
          };

          const current = this.transactionsSubject.value;
          const index = current.findIndex((t) => t.id === id);
          if (index >= 0) {
            current[index] = transformed;
            this.transactionsSubject.next([...current]);
          }

          return transformed;
        }),
        catchError((error) => {
          console.error('Update transaction stage error:', error);
          return throwError(() => error.error?.message || 'Failed to update transaction');
        })
      );
  }

  getTransaction(id: string): Observable<Transaction | undefined> {
    const token = this.authService.getToken();
    if (!token) {
      return of(undefined);
    }

    return this.http
      .get<BackendTransaction>(`${environment.apiUrl}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((transaction) => ({
          id: transaction.id,
          listingTitle: transaction.listingTitle,
          counterparty: transaction.counterparty,
          value: transaction.value,
          stage: transaction.stage,
          updatedAt: transaction.updatedAt,
          documents: transaction.documents,
        })),
        catchError((error) => {
          console.error('Get transaction error:', error);
          return of(undefined);
        })
      );
  }
}
