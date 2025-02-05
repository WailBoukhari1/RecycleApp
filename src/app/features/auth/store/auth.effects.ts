import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import * as AuthActions from './auth.actions';
import { Store } from '@ngrx/store';
import { selectAuthUser } from './auth.selectors';

@Injectable()
export class AuthEffects {
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initAuth),
      map(() => {
        const user = this.authService.getCurrentUser();
        return user ? AuthActions.loginSuccess({ user }) : AuthActions.logoutSuccess();
      })
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(user => {
            this.router.navigate(['/home']);
            return AuthActions.loginSuccess({ user });
          }),
          catchError(error => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ userData }) =>
        this.authService.register(userData).pipe(
          map(user => AuthActions.registerSuccess({ user })),
          catchError(error => of(AuthActions.registerFailure({ error: error.message })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      withLatestFrom(this.actions$.pipe(ofType(AuthActions.login))),
      tap(([{ user }, loginAction]) => {
        if (loginAction) {
          this.notificationService.success('Welcome back!');
          this.router.navigate(['/home']);
        }
      })
    ),
    { dispatch: false }
  );

  authFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure, AuthActions.registerFailure),
      tap(({ error }) => {
        this.notificationService.error(error);
      })
    ),
    { dispatch: false }
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ user }) => {
        this.notificationService.success('Registration successful! Welcome to RecycleHub');
        const route = user.userType === 'collector' ? '/collector-dashboard' : '/user-dashboard';
        this.router.navigate([route]);
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => this.authService.clearSession()),
      map(() => AuthActions.logoutSuccess())
    )
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => this.router.navigate(['/login']))
    ),
    { dispatch: false }
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfile),
      withLatestFrom(this.store.select(selectAuthUser)),
      mergeMap(([{ userData }, currentUser]) =>
        this.authService.updateProfile(currentUser!.id!, userData).pipe(
          map(user => AuthActions.updateProfileSuccess({ user })),
          catchError(error => of(AuthActions.updateProfileFailure({ error: error.message })))
        )
      )
    )
  );

  updateProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfileSuccess),
      tap(() => {
        this.notificationService.success('Profile updated successfully');
      })
    ),
    { dispatch: false }
  );

  updateProfileFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateProfileFailure),
      tap(({ error }) => {
        this.notificationService.error(`Failed to update profile: ${error}`);
      })
    ),
    { dispatch: false }
  );

  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteAccount),
      withLatestFrom(this.store.select(selectAuthUser)),
      mergeMap(([_, user]) =>
        this.authService.deleteAccount(user!.id!).pipe(
          map(() => AuthActions.deleteAccountSuccess()),
          catchError(error => of(AuthActions.deleteAccountFailure({ error: error.message })))
        )
      )
    )
  );

  deleteAccountSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteAccountSuccess),
      tap(() => {
        this.notificationService.success('Account deleted successfully');
      }),
      map(() => AuthActions.logoutSuccess())
    )
  );

  deleteAccountFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteAccountFailure),
      tap(({ error }) => {
        this.notificationService.error(`Failed to delete account: ${error}`);
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private store: Store,
    private location: Location,
    private notificationService: NotificationService
  ) {}
} 