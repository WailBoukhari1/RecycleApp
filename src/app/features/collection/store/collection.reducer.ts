import { createReducer, on } from '@ngrx/store';
import { CollectionRequest } from '../../../core/models/collection.model';
import * as CollectionActions from './collection.actions';

export interface CollectionState {
  requests: CollectionRequest[];
  pendingRequests: CollectionRequest[];
  loading: boolean;
  error: string | null;
}

export const initialState: CollectionState = {
  requests: [],
  pendingRequests: [],
  loading: false,
  error: null
};

export const collectionReducer = createReducer(
  initialState,
  
  on(CollectionActions.createCollectionRequest, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CollectionActions.createCollectionRequestSuccess, (state, { request }) => ({
    ...state,
    requests: [...state.requests, request],
    pendingRequests: [...state.pendingRequests, request],
    loading: false
  })),
  
  on(CollectionActions.createCollectionRequestFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(CollectionActions.loadPendingRequests, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CollectionActions.loadPendingRequestsSuccess, (state, { requests }) => ({
    ...state,
    pendingRequests: requests,
    loading: false
  })),
  
  on(CollectionActions.loadPendingRequestsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 