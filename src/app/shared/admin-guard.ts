import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.currentUser) {
      this.router.navigate(['/auth']);
      return false;
    }
    const { email } = this.authService.currentUser;
    if (email === 'admin@kireygroup.com') {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
