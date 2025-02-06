import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private notificationService: MatSnackBar
  ) {}

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initAuth),
      map(() => {
        const user = this.authService.getCurrentUser();
        return user ? AuthActions.loginSuccess({ user, showNotification: false }) : AuthActions.logoutSuccess();
      })
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(user => AuthActions.loginSuccess({ user, showNotification: true })),
          catchError(error => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ user, showNotification }) => {
        if (showNotification) {
          this.notificationService.open('Login successful! Welcome back', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          const dashboardPath = `/dashboard/${user.role}`;
          this.router.navigate([dashboardPath]);
        }
      })
    ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      tap(({ error }) => {
        this.notificationService.open(error || 'Login failed', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      })
    ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ userData }) =>
        this.authService.register(userData).pipe(
          map(user => AuthActions.registerSuccess({ user })),
          catchError(error => of(AuthActions.registerFailure({ error: error.message })))
        )
      )
    )
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ user }) => {
        this.notificationService.open('Registration successful! Welcome to RecycleHub', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        const dashboardPath = `/dashboard/${user.role}`;
        this.router.navigate([dashboardPath]);
      })
    ),
    { dispatch: false }
  );

  registerFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerFailure),
      tap(({ error }) => {
        this.notificationService.open(error || 'Registration failed', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.logout();
      }),
      map(() => AuthActions.logoutSuccess())
    )
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfile),
      switchMap(({ userData }) => {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          return of(AuthActions.updateProfileFailure({ error: 'No user logged in' }));
        }
        return this.authService.updateProfile(currentUser.id, userData).pipe(
          map(user => AuthActions.updateProfileSuccess({ user })),
          catchError(error => of(AuthActions.updateProfileFailure({ error: error.message })))
        );
      })
    )
  );

  updateProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfileSuccess),
      tap(() => {
        this.notificationService.open('Profile updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      })
    ),
    { dispatch: false }
  );

  updateProfileFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfileFailure),
      tap(({ error }) => {
        this.notificationService.open(error || 'Failed to update profile', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      })
    ),
    { dispatch: false }
  );

  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteAccount),
      switchMap(() => {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          return of(AuthActions.deleteAccountFailure({ error: 'No user logged in' }));
        }
        return this.authService.deleteAccount(currentUser.id).pipe(
          map(() => AuthActions.deleteAccountSuccess()),
          catchError(error => of(AuthActions.deleteAccountFailure({ error: error.message })))
        );
      })
    )
  );

  deleteAccountSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteAccountSuccess),
      tap(() => {
        this.notificationService.open('Account deleted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  deleteAccountFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteAccountFailure),
      tap(({ error }) => {
        this.notificationService.open(error || 'Failed to delete account', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      })
    ),
    { dispatch: false }
  );
} 