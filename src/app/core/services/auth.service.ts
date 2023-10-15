import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { type Observable } from 'rxjs';

import { LocalService } from './local.service';
import { type User } from '../models/user.model';

type LoginValidationErrors =
  | { wrongPassword: boolean }
  | { wrongEmail: boolean };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/users';
  public currentUser: User | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly local: LocalService
  ) {
    this.currentUser = this.local.get('KIREY__user');
  }

  login(
    email: string,
    password: string
  ): Observable<User | LoginValidationErrors> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users) => {
        const user = users.find(
          (user) => user.email === email && user.password === password
        );
        if (user) return user;

        const emailExist = users.find((user) => user.email === email);
        if (emailExist) return { wrongPassword: true };
        else return { wrongEmail: true };
      })
    );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  signOut(): void {
    this.local.remove('KIREY__user');
    this.updateCurrentUser();
  }

  changeAmount(amount: number): Observable<User> | null {
    if (!this.currentUser) return null;
    return this.http.patch<User>(`${this.apiUrl}/${this.currentUser.id}`, {
      accountAmount: amount,
    });
  }

  emailAlreadyExists(email: string): Observable<string | null> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users) => {
        const user = users.find((user) => user.email === email);

        return user?.email || null;
      })
    );
  }

  userHasAmount(amount: number): boolean {
    const userAmount = this.currentUser?.accountAmount || 0;
    return userAmount >= amount;
  }

  updateCurrentUser(): void {
    this.currentUser = this.local.get('KIREY__user');
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:3000/users');
  }

  deleteUser(userId: User['id']): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}`);
  }
}
