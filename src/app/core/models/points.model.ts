export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'EARNED' | 'REDEEMED';
  source: 'COLLECTION' | 'VOUCHER';
  timestamp: string;
  collectionId?: string;
  voucherId?: string;
  description?: string;
}

export interface Voucher {
  id: string;
  userId: string;
  points: number;
  value: number;
  code: string;
  createdAt: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  expiresAt: string;
}

export const REWARD_TIERS = [
  { points: 100, value: 50, label: '50 Dh Voucher' },
  { points: 200, value: 120, label: '120 Dh Voucher' },
  { points: 500, value: 350, label: '350 Dh Voucher' }
] as const; 