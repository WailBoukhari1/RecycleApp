import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PointsState } from './points.reducer';

export const selectPointsState = createFeatureSelector<PointsState>('points');

export const selectVouchers = createSelector(
  selectPointsState,
  state => state.vouchers
);

export const selectPointsLoading = createSelector(
  selectPointsState,
  state => state.loading
);

export const selectPointsError = createSelector(
  selectPointsState,
  state => state.error
);

export const selectTotalPointsSpent = createSelector(
  selectVouchers,
  vouchers => vouchers.reduce((total, voucher) => total + voucher.points, 0)
); 