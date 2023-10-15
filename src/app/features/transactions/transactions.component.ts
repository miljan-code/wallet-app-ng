import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { TransactionDialogComponent } from './transaction-dialog.component';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { type Transaction } from 'src/app/core/models/transaction.model';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TableModule,
    ConfirmDialogModule,
    TransactionDialogComponent,
  ],
  standalone: true,
})
export class TransactionsComponent implements OnInit, OnDestroy {
  @ViewChild(TransactionDialogComponent)
  private dialogComponent!: TransactionDialogComponent;

  transactions: Transaction[] = [];
  isLoading = true;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly transactionService: TransactionService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTransactions(): void {
    this.isLoading = true;
    this.transactionService
      .getTransactions()
      ?.pipe(takeUntil(this.destroy$))
      .subscribe((transactions: Transaction[]) => {
        this.transactions = transactions;
        this.isLoading = false;
      });
  }

  showDialog(tx: Transaction | null) {
    this.dialogComponent.showDialog(tx);
  }

  deleteTransaction(txId: string): void {
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
