import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { AdminDialogComponent } from './admin-dialog.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { type User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TableModule,
    ConfirmDialogModule,
    AdminDialogComponent,
  ],
  standalone: true,
})
export class AdminComponent implements OnInit, OnDestroy {
  @ViewChild(AdminDialogComponent)
  private dialogComponent!: AdminDialogComponent;

  users: User[] = [];
  isLoading = true;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showDialog(userId: User['id']) {
    this.dialogComponent.showDialog(userId);
  }

  getUsers(): void {
    this.isLoading = true;
    this.authService
      .getUsers()
      ?.pipe(takeUntil(this.destroy$))
      .subscribe((users: User[]) => {
        this.users = users;
        this.isLoading = false;
      });
  }

  deleteUser(userId: string): void {
    this.authService
      .deleteUser(userId)
      ?.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const filteredUsers = this.users.filter((user) => user.id !== userId);
        this.users = filteredUsers;
      });
  }

  confirmDelete(userId: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      accept: () => {
        this.deleteUser(userId);
      },
    });
  }
}
