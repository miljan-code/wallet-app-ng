import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';

import { LocalService } from 'src/app/core/services/local.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { CustomValidators } from 'src/app/shared/custom-validators';
import { type Transaction } from 'src/app/core/models/transaction.model';

interface TransactionForm {
  purchasedItem: FormControl<string>;
  category: FormControl<string>;
  date: FormControl<Date>;
  amountSpent: FormControl<number>;
}

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  imports: [
    ButtonModule,
    InputTextModule,
    CalendarModule,
    DialogModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class TransactionDialogComponent implements OnInit {
  @Input() transactions: Transaction[] = [];
  @Output() getTxEvent = new EventEmitter<string>();

  dialogVisible = false;
  transactionForm!: FormGroup<TransactionForm>;
  editTx: Transaction | null = null;
  isAdminEdit = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly transactionService: TransactionService,
    private readonly authService: AuthService,
    private readonly local: LocalService
  ) {}

  ngOnInit(): void {
    this.transactionForm = new FormGroup<TransactionForm>({
      purchasedItem: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      category: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      date: new FormControl(new Date(), {
        validators: [Validators.required],
        nonNullable: true,
      }),
      amountSpent: new FormControl(0, {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
  }

  showDialog(tx: Transaction | null, adminEdit: boolean = false): void {
    this.isAdminEdit = adminEdit;
    this.editTx = tx;
    const purchasedItem = tx ? tx.purchasedItem : '';
    const category = tx ? tx.category : '';
    const date = tx ? new Date(tx.date) : new Date();
    const amountSpent = tx ? tx.amountSpent : 0;

    this.transactionForm.setValue({
      purchasedItem,
      category,
      date,
      amountSpent,
    });
    if (!adminEdit) {
      this.transactionForm
        .get('amountSpent')
        ?.addValidators([
          CustomValidators.spentAmountValidator(this.authService, tx),
        ]);
    }

    this.dialogVisible = !this.dialogVisible;
  }

  submitTransaction(): void {
    const transactionData = this.transactionForm.value as Transaction;
    this.transactionService
      .submitTransaction(transactionData)
      ?.pipe(takeUntil(this.destroy$))
      .subscribe((transaction) => {
        this.transactions.push(transaction);
        const amount = this.authService.currentUser?.accountAmount || 0;
        this.changeAmount(amount - transaction.amountSpent);
        this.showDialog(null);
      });
  }

  editTransaction(txId: string, adminEdit: boolean = false): void {
    const transactionData = this.transactionForm.value as Transaction;
    this.transactionService
      .editTransaction(txId, transactionData)
      ?.pipe(takeUntil(this.destroy$))
      .subscribe((transaction) => {
        const index = this.transactions
          .map((i) => i.id)
          .indexOf(transaction.id);
        const prevAmount = this.editTx?.amountSpent || 0;
        this.transactions.splice(index, 1, transaction);
        this.getTxEvent.emit(transaction.userId);
        this.showDialog(null);
        if (adminEdit) return;
        const diffAmount = prevAmount - transaction.amountSpent;
        const accAmount = this.authService.currentUser?.accountAmount || 0;
        this.changeAmount(accAmount + diffAmount);
      });
  }

  changeAmount(amount: number): void {
    this.authService.changeAmount(amount || 0)?.subscribe((updatedUser) => {
      if (updatedUser) {
        this.local.save('KIREY__user', updatedUser);
        this.authService.updateCurrentUser();
      } else {
        console.log('Failed to update accountAmount.');
      }
    });
  }
}
