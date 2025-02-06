import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CollectionService } from '../../../core/services/collection.service';
import * as CollectionActions from './collection.actions';

@Injectable()
export class CollectionEffects {
  loadUserRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.loadUserRequests),
      mergeMap(() =>
        this.collectionService.getUserRequests().pipe(
          tap(requests => console.log('User Requests:', requests)),
          map(requests => CollectionActions.loadUserRequestsSuccess({ requests })),
          catchError(error => of(CollectionActions.loadUserRequestsFailure({ error: error.message })))
        )
      )
    )
  );

  createRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.createCollectionRequest),
      mergeMap(({ request }) =>
        this.collectionService.createRequest(request).pipe(
          map(createdRequest => CollectionActions.createCollectionRequestSuccess({ request: createdRequest })),
          catchError(error => of(CollectionActions.createCollectionRequestFailure({ error: error.message })))
        )
      )
    )
  );

  createRequestSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.createCollectionRequestSuccess),
      tap(() => {
        this.snackBar.open('Request created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/collection/my-requests']);
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private collectionService: CollectionService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
} 