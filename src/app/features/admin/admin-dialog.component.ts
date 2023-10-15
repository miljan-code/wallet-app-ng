import {
  Component,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil, Subject } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { TransactionDialogComponent } from '../transactions/transaction-dialog.component';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { type Transaction } from 'src/app/core/models/transaction.model';
import { type User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-admin-dialog',
  templateUrl: './admin-dialog.component.html',
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TableModule,
    TransactionDialogComponent,
    ConfirmDialogModule,
  ],
  standalone: true,
})
export class AdminDialogComponent implements OnDestroy {
  @Output() getTxEvent = new EventEmitter<string>();
  @ViewChild(TransactionDialogComponent)
  private dialogComponent!: TransactionDialogComponent;

  transactions: Transaction[] = [];
  dialogVisible = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly transactionService: TransactionService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showDialog(userId: User['id']): void {
    this.getTransactions(userId);
    this.dialogVisible = !this.dialogVisible;
  }

  showEditDialog(transaction: Transaction): void {
    this.dialogComponent.showDialog(transaction, true);
  }

  getTransactions(userId: User['id']): void {
    this.transactionService
      .getTransactionsById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((transactions) => {
        this.transactions = transactions;
      });
  }

  deleteTransaction(txId: Transaction['id']): void {
    this.transactionService
      .deleteTransaction(txId)
      ?.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const filteredTransactions = this.transactions.filter(
          (tx) => tx.id !== txId
        );
        this.transactions = filteredTransactions;
      });
  }

  confirmDelete(txId: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this transaction?',
      accept: () => {
        this.deleteTransaction(txId);
      },
    });
  }
}
