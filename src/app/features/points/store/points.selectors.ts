import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PointsState } from './points.reducer';

export const selectPointsState = createFeatureSelector<PointsState>('points');

export const selectPoints = createSelector(
  selectPointsState,
  state => state.points
);

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

export const selectLatestVouchers = createSelector(
  selectVouchers,
  vouchers => vouchers
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
);

export const selectTotalPointsSpent = createSelector(
  selectVouchers,
  vouchers => vouchers.reduce((total, voucher) => total + voucher.points, 0)
); 