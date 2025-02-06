import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import { PointsService } from '../../../core/services/points.service';
import { AuthService } from '../../../core/services/auth.service';
import * as PointsActions from './points.actions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class PointsEffects {
  loadPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.loadPoints),
      mergeMap(() => {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          return of(PointsActions.loadPointsFailure({ error: 'User not found' }));
        }
        return of(PointsActions.loadPointsSuccess({ points: currentUser.points || 0 }));
      })
    )
  );

  loadVouchers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.loadVouchers),
      mergeMap(() =>
        this.pointsService.getUserVouchers().pipe(
          map(vouchers => PointsActions.loadVouchersSuccess({ vouchers })),
          catchError(error => of(PointsActions.loadVouchersFailure({ error: error.message })))
        )
      )
    )
  );

  redeemPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.redeemPoints),
      mergeMap(({ points }) =>
        this.pointsService.redeemPoints(points).pipe(
          map(voucher => {
            const currentUser = this.authService.getCurrentUser();
            const remainingPoints = (currentUser?.points || 0) - points;
            
            this.snackBar.open(
              `Successfully redeemed ${points} points for a ${voucher.value} Dh voucher!`,
              'Close',
              { duration: 5000 }
            );
            
            return PointsActions.redeemPointsSuccess({ voucher, remainingPoints });
          }),
          catchError(error => {
            this.snackBar.open(
              error.message || 'Failed to redeem points',
              'Close',
              { duration: 3000 }
            );
            return of(PointsActions.redeemPointsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private pointsService: PointsService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}
} 