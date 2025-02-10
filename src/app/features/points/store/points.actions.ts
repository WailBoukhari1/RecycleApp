import { createAction, props } from '@ngrx/store';
import { PointTransaction, Voucher } from '../../../core/models/points.model';

// Load Points
export const loadUserPoints = createAction('[Points] Load User Points', props<{ userId: string }>());
export const loadUserPointsSuccess = createAction(
  '[Points] Load User Points Success',
  props<{ balance: number; transactions: PointTransaction[]; vouchers: Voucher[] }>()
);
export const loadUserPointsFailure = createAction(
  '[Points] Load User Points Failure',
  props<{ error: string }>()
);

// Earn Points
export const earnPoints = createAction(
  '[Points] Earn Points',
  props<{ userId: string; points: number; collectionId: string; description?: string }>()
);
export const earnPointsSuccess = createAction(
  '[Points] Earn Points Success',
  props<{ transaction: PointTransaction; newBalance: number }>()
);
export const earnPointsFailure = createAction(
  '[Points] Earn Points Failure',
  props<{ error: string }>()
);

// Redeem Points
export const redeemPoints = createAction(
  '[Points] Redeem Points',
  props<{ userId: string; points: number }>()
);
export const redeemPointsSuccess = createAction(
  '[Points] Redeem Points Success',
  props<{ voucher: Voucher; transaction: PointTransaction; newBalance: number }>()
);
export const redeemPointsFailure = createAction(
  '[Points] Redeem Points Failure',
  props<{ error: string }>()
); 