import { createReducer, on } from '@ngrx/store';
import { initialPointsState } from './points.state';
import * as PointsActions from './points.actions';

export const pointsReducer = createReducer(
  initialPointsState,
  
  // Load Points
  on(PointsActions.loadUserPoints, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PointsActions.loadUserPointsSuccess, (state, { balance, transactions, vouchers }) => ({
    ...state,
    balance,
    transactions,
    vouchers,
    loading: false,
    error: null
  })),
  
  on(PointsActions.loadUserPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Earn Points
  on(PointsActions.earnPoints, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PointsActions.earnPointsSuccess, (state, { transaction, newBalance }) => ({
    ...state,
    balance: newBalance,
    transactions: [transaction, ...state.transactions],
    loading: false,
    error: null
  })),
  
  on(PointsActions.earnPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Redeem Points
  on(PointsActions.redeemPoints, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PointsActions.redeemPointsSuccess, (state, { voucher, transaction, newBalance }) => ({
    ...state,
    balance: newBalance,
    transactions: [transaction, ...state.transactions],
    vouchers: [voucher, ...state.vouchers],
    loading: false,
    error: null
  })),
  
  on(PointsActions.redeemPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 