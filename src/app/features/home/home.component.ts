import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from 'src/app/core/services/auth.service';
import { LocalService } from 'src/app/core/services/local.service';

interface AmountForm {
  accountAmount: FormControl<number>;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  standalone: true,
})
export class HomeComponent implements OnInit {
  username = '';
  accountAmount = 0;
  dialogVisible = false;
  amountForm!: FormGroup<AmountForm>;

  constructor(
    private readonly authService: AuthService,
    private readonly local: LocalService
  ) {
    this.username = `${this.authService.currentUser?.firstName} ${this.authService.currentUser?.lastName}`;
    this.accountAmount = this.authService.currentUser?.accountAmount || 0;
  }

  ngOnInit(): void {
    this.amountForm = new FormGroup<AmountForm>({
      accountAmount: new FormControl(0, {
        validators: [Validators.required, Validators.min(1)],
        nonNullable: true,
      }),
    });
  }

  dialogHandler(): void {
    this.dialogVisible = !this.dialogVisible;
  }

  changeAmount(): void {
    const amount = this.amountForm.value.accountAmount;
    this.authService.changeAmount(amount || 0)?.subscribe((updatedUser) => {
      if (updatedUser) {
        this.local.save('KIREY__user', updatedUser);
        this.authService.updateCurrentUser();
        this.accountAmount = this.authService.currentUser?.accountAmount || 0;
        this.dialogHandler();
      } else {
        console.log('Failed to update accountAmount.');
      }
    });
  }
}
