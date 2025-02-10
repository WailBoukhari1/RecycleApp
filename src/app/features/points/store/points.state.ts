import { PointTransaction, Voucher } from '../../../core/models/points.model';

export interface PointsState {
  balance: number;
  transactions: PointTransaction[];
  vouchers: Voucher[];
  loading: boolean;
  error: string | null;
}

export const initialPointsState: PointsState = {
  balance: 0,
  transactions: [],
  vouchers: [],
  loading: false,
  error: null
}; 