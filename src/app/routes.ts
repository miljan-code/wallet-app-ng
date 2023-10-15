import { type Routes } from '@angular/router';

import { AuthGuard } from './shared/auth-guard';
import { AdminGuard } from './shared/admin-guard';

export const routesConfig: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/layout.component').then((c) => c.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions.component').then(
            (c) => c.TransactionsComponent
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/admin.component').then(
            (c) => c.AdminComponent
          ),
        canActivate: [AdminGuard],
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./core/auth/auth.component').then((c) => c.AuthComponent),
    title: 'Authentication',
  },
];
