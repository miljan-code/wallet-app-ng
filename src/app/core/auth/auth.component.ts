import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

import { AuthService } from '../services/auth.service';
import { LocalService } from '../services/local.service';
import { CustomValidators } from 'src/app/shared/custom-validators';
import { type User } from '../models/user.model';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

interface RegisterForm extends LoginForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  accountAmount: FormControl<number>;
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DialogModule,
  ],
  standalone: true,
})
export class AuthComponent implements OnInit, OnDestroy {
  dialogVisible = false;
  loginForm!: FormGroup<LoginForm>;
  registerForm!: FormGroup<RegisterForm>;
  loading = false;
  loadingSubscription!: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly local: LocalService
  ) {}

  ngOnInit(): void {
    this.loadingSubscription = CustomValidators.loading$.subscribe(
      (isLoading) => (this.loading = isLoading)
    );

    this.loginForm = new FormGroup<LoginForm>({
      email: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      password: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });

    this.registerForm = new FormGroup<RegisterForm>({
      firstName: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      lastName: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [
          CustomValidators.emailExistValidator(this.authService),
        ],
        nonNullable: true,
      }),
      password: new FormControl('', {
        validators: [Validators.required, CustomValidators.passwordValidator],
        nonNullable: true,
      }),
      accountAmount: new FormControl(0, {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loadingSubscription.unsubscribe();
  }

  showDialog(): void {
    this.dialogVisible = !this.dialogVisible;
  }

  submitLogin(): void {
    const { email, password } = this.loginForm.value;
    if (!email || !password) return;
    this.authService
      .login(email, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if ('id' in res) {
          this.local.save('KIREY__user', res);
          this.authService.updateCurrentUser();
          this.router.navigate(['/']);
        } else {
          if ('wrongEmail' in res) {
            this.loginForm.controls.email.setErrors({
              wrongEmail: res.wrongEmail,
            });
          } else {
            this.loginForm.controls.password.setErrors({
              wrongPassword: res.wrongPassword,
            });
          }
        }
      });
  }

  submitRegister(): void {
    const userData = this.registerForm.value as User;
    this.authService
      .register(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.local.save('KIREY__user', user);
        this.authService.updateCurrentUser();
        this.router.navigate(['/']);
      });
  }
}
