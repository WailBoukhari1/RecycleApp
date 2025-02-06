import { createAction, props } from '@ngrx/store';
import { CollectionRequest } from '../../../core/models/collection.model';

// Load User Requests
export const loadUserRequests = createAction(
  '[Collection] Load User Requests'
);

export const loadUserRequestsSuccess = createAction(
  '[Collection] Load User Requests Success',
  props<{ requests: CollectionRequest[] }>()
);

export const loadUserRequestsFailure = createAction(
  '[Collection] Load User Requests Failure',
  props<{ error: string }>()
);

// Create Request
export const createCollectionRequest = createAction(
  '[Collection] Create Request',
  props<{ request: CollectionRequest }>()
);

export const createCollectionRequestSuccess = createAction(
  '[Collection] Create Request Success',
  props<{ request: CollectionRequest }>()
);

export const createCollectionRequestFailure = createAction(
  '[Collection] Create Request Failure',
  props<{ error: string }>()
);

export const loadPendingRequests = createAction(
  '[Collection] Load Pending Requests'
);

export const loadPendingRequestsSuccess = createAction(
  '[Collection] Load Pending Requests Success',
  props<{ requests: CollectionRequest[] }>()
);

export const loadPendingRequestsFailure = createAction(
  '[Collection] Load Pending Requests Failure',
  props<{ error: string }>()
);

export const deleteCollectionRequest = createAction(
  '[Collection] Delete Collection Request',
  props<{ requestId: string }>()
); 