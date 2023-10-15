import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { type Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { type Transaction } from '../models/transaction.model';
import { type User } from '../models/user.model';

type TxData = Pick<
  Transaction,
  'amountSpent' | 'category' | 'date' | 'purchasedItem'
>;

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly apiUrl = 'http://localhost:3000/transactions';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getTransactions(): Observable<Transaction[]> | null {
    const userId = this.authService.currentUser?.id;
    if (!userId) return null;
    return this.http.get<Transaction[]>(`${this.apiUrl}?userId=${userId}`);
  }

  getTransactionsById(userId: User['id']): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}?userId=${userId}`);
  }

  submitTransaction(transaction: Transaction): Observable<Transaction> | null {
    const userId = this.authService.currentUser?.id;
    if (!userId) return null;
    return this.http.post<Transaction>(this.apiUrl, { ...transaction, userId });
  }

  editTransaction(
    txId: Transaction['id'],
    txData: TxData
  ): Observable<Transaction> | null {
    return this.http.patch<Transaction>(`${this.apiUrl}/${txId}`, txData);
  }

  deleteTransaction(transactionId: Transaction['id']): Observable<Transaction> {
    return this.http.delete<Transaction>(`${this.apiUrl}/${transactionId}`);
  }
}
