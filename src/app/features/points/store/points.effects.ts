import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { PointsService } from '../../../core/services/points.service';
import { NotificationService } from '../../../core/services/notification.service';
import * as PointsActions from './points.actions';

@Injectable()
export class PointsEffects {
  loadPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.loadUserPoints),
      mergeMap(({ userId }) =>
        this.pointsService.loadUserPoints(userId).pipe(
          map(({ balance, transactions, vouchers }) =>
            PointsActions.loadUserPointsSuccess({ balance, transactions, vouchers })
          ),
          catchError(error => of(PointsActions.loadUserPointsFailure({ error: error.message })))
        )
      )
    )
  );

  earnPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.earnPoints),
      mergeMap(action =>
        this.pointsService.earnPoints(
          action.userId,
          action.points,
          action.collectionId,
          action.description
        ).pipe(
          map(result => PointsActions.earnPointsSuccess(result)),
          catchError(error => of(PointsActions.earnPointsFailure({ error: error.message })))
        )
      )
    )
  );

  redeemPoints$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.redeemPoints),
      mergeMap(({ userId, points }) =>
        this.pointsService.redeemPoints(points).pipe(
          map(({ voucher, transaction, newBalance }) =>
            PointsActions.redeemPointsSuccess({ voucher, transaction, newBalance })
          ),
          catchError(error => of(PointsActions.redeemPointsFailure({ error: error.message })))
        )
      )
    )
  );

  pointsSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.earnPointsSuccess),
      tap(({ transaction }) => {
        this.notificationService.success(
          `Earned ${transaction.amount} points for recycling!`
        );
      })
    ),
    { dispatch: false }
  );

  pointsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PointsActions.earnPointsFailure),
      tap(({ error }) => {
        this.notificationService.error(`Failed to award points: ${error}`);
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private pointsService: PointsService,
    private notificationService: NotificationService
  ) {}
} 