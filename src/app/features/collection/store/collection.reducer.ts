import { createReducer, on } from '@ngrx/store';
import { CollectionRequest } from '../../../core/models/collection.model';
import * as CollectionActions from './collection.actions';

export interface CollectionState {
  requests: CollectionRequest[];
  loading: boolean;
  error: string | null;
}

export const initialState: CollectionState = {
  requests: [],
  loading: false,
  error: null
};

export const collectionReducer = createReducer(
  initialState,
  
  // Load User Requests
  on(CollectionActions.loadUserRequests, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CollectionActions.loadUserRequestsSuccess, (state, { requests }) => ({
    ...state,
    requests,
    loading: false,
    error: null
  })),
  
  on(CollectionActions.loadUserRequestsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create Request
  on(CollectionActions.createCollectionRequest, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CollectionActions.createCollectionRequestSuccess, (state, { request }) => ({
    ...state,
    requests: [...state.requests, request],
    loading: false,
    error: null
  })),
  
  on(CollectionActions.createCollectionRequestFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 