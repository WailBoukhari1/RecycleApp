import { createReducer, on } from '@ngrx/store';
import { RewardVoucher } from '../../../core/services/points.service';
import * as PointsActions from './points.actions';

export interface PointsState {
  points: number;
  vouchers: RewardVoucher[];
  loading: boolean;
  error: string | null;
}

export const initialState: PointsState = {
  points: 0,
  vouchers: [],
  loading: false,
  error: null
};

export const pointsReducer = createReducer(
  initialState,

  // Load Points
  on(PointsActions.loadPoints, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(PointsActions.loadPointsSuccess, (state, { points }) => ({
    ...state,
    points,
    loading: false,
    error: null
  })),

  on(PointsActions.loadPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Vouchers
  on(PointsActions.loadVouchers, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(PointsActions.loadVouchersSuccess, (state, { vouchers }) => ({
    ...state,
    vouchers,
    loading: false,
    error: null
  })),

  on(PointsActions.loadVouchersFailure, (state, { error }) => ({
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

  on(PointsActions.redeemPointsSuccess, (state, { voucher, remainingPoints }) => ({
    ...state,
    points: remainingPoints,
    vouchers: [...state.vouchers, voucher],
    loading: false,
    error: null
  })),

  on(PointsActions.redeemPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 