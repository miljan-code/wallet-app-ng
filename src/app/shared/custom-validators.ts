import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  switchMap,
  finalize,
  Subject,
} from 'rxjs';

import { AuthService } from '../core/services/auth.service';
import { type Transaction } from '../core/models/transaction.model';

export class CustomValidators {
  static loading$ = new Subject<boolean>();

  static passwordValidator(
    control: AbstractControl
  ): { passwordRequirements: boolean } | null {
    const value: string = control.value;

    if (!value) return null;

    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(value);
    const isLengthValid = value.length >= 5;

    const isValid =
      hasUppercase && hasNumber && hasSpecialCharacter && isLengthValid;

    return isValid ? null : { passwordRequirements: true };
  }

  static emailExistValidator(authService: AuthService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      this.loading$.next(true);
      return control.valueChanges.pipe(
        debounceTime(1500),
        distinctUntilChanged(),
        switchMap((value) => {
          return authService
            .emailAlreadyExists(value)
            .pipe(map((email) => (email ? { emailExist: true } : null)));
        }),
        first(),
        finalize(() => this.loading$.next(false))
      );
    };
  }

  static spentAmountValidator(
    authService: AuthService,
    tx: Transaction | null
  ) {
    return (control: AbstractControl): ValidationErrors | null => {
      const prevAmount = tx?.amountSpent || 0;
      const isValid = authService.userHasAmount(control.value - prevAmount);
      if (isValid) return null;
      else return { insufficientAmount: true };
    };
  }
}
