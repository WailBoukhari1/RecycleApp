import { createAction, props } from '@ngrx/store';
import { RewardVoucher } from '../../../core/services/points.service';

// Load Points
export const loadPoints = createAction(
  '[Points] Load Points'
);

export const loadPointsSuccess = createAction(
  '[Points] Load Points Success',
  props<{ points: number }>()
);

export const loadPointsFailure = createAction(
  '[Points] Load Points Failure',
  props<{ error: string }>()
);

// Load Vouchers
export const loadVouchers = createAction(
  '[Points] Load Vouchers'
);

export const loadVouchersSuccess = createAction(
  '[Points] Load Vouchers Success',
  props<{ vouchers: RewardVoucher[] }>()
);

export const loadVouchersFailure = createAction(
  '[Points] Load Vouchers Failure',
  props<{ error: string }>()
);

// Redeem Points
export const redeemPoints = createAction(
  '[Points] Redeem Points',
  props<{ points: number; value: number }>()
);

export const redeemPointsSuccess = createAction(
  '[Points] Redeem Points Success',
  props<{ voucher: RewardVoucher; remainingPoints: number }>()
);

export const redeemPointsFailure = createAction(
  '[Points] Redeem Points Failure',
  props<{ error: string }>()
); 