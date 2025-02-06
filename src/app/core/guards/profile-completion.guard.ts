import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { selectAuthUser } from '../../features/auth/store/auth.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ProfileCompletionGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectAuthUser).pipe(
      map(user => {
        if (!user) {
          return this.router.createUrlTree(['/auth/login']);
        }

        const isProfileComplete = !!(
          user.phoneNumber &&
          user.dateOfBirth &&
          user.address?.street &&
          user.address?.district &&
          user.address?.city &&
          user.address?.postalCode
        );

        if (!isProfileComplete) {
          this.snackBar.open(
            'Please complete your profile before accessing collection features',
            'Go to Profile',
            { duration: 5000 }
          ).onAction().subscribe(() => {
            this.router.navigate(['/profile']);
          });
          return this.router.createUrlTree(['/profile']);
        }

        return true;
      })
    );
  }
} 