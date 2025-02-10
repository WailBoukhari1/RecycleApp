import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PointsState } from './points.state';
import { Voucher } from '../../../core/models/points.model';

export const selectPointsState = createFeatureSelector<PointsState>('points');

export const selectBalance = createSelector(
  selectPointsState,
  (state: PointsState) => state.balance
);

export const selectTransactions = createSelector(
  selectPointsState,
  (state: PointsState) => state.transactions
);

export const selectVouchers = createSelector(
  selectPointsState,
  (state: PointsState) => state.vouchers
);

export const selectLoading = createSelector(
  selectPointsState,
  (state: PointsState) => state.loading
);

export const selectError = createSelector(
  selectPointsState,
  (state: PointsState) => state.error
);

export const selectSortedVouchers = createSelector(
  selectVouchers,
  (vouchers) => [...vouchers].sort((a: Voucher, b: Voucher) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
);

export const selectTotalPointsRedeemed = createSelector(
  selectVouchers,
  (vouchers) => vouchers.reduce((total: number, voucher: Voucher) => 
    total + voucher.points, 0
  )
); 