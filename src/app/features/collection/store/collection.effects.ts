import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { CollectionService } from '../../../core/services/collection.service';
import * as CollectionActions from './collection.actions';

@Injectable()
export class CollectionEffects {
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

  loadPendingRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CollectionActions.loadPendingRequests),
      mergeMap(() =>
        this.collectionService.getPendingRequests().pipe(
          map(requests => CollectionActions.loadPendingRequestsSuccess({ requests })),
          catchError(error => of(CollectionActions.loadPendingRequestsFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private collectionService: CollectionService
  ) {}
} 