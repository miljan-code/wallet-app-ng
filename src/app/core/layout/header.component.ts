import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { AuthService } from '../services/auth.service';
import { AuthGuard } from 'src/app/shared/auth-guard';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
})
export class HeaderComponent {
  isAdmin = false;

  constructor(
    private readonly authService: AuthService,
    private readonly authGuard: AuthGuard
  ) {
    this.isAdmin =
      this.authService.currentUser?.email === 'admin@kireygroup.com';
  }

  signOut() {
    this.authService.signOut();
    this.authGuard.canActivate();
  }
}
