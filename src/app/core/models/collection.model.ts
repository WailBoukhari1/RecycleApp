export type WasteType = 'plastic' | 'paper' | 'glass' | 'metal';

export type CollectionStatus = 'pending' | 'occupied' | 'in_progress' | 'validated' | 'rejected';

export interface TimeSlot {
  date: string;
  startTime: string;  // Between 09:00 and 18:00
  endTime: string;
}

export interface WasteItem {
  type: WasteType;
  weight: number;  // in kg, minimum 1kg
  photos?: string[];
}

export interface CollectionRequest {
  id: string;
  userId: string;
  userCity: string;
  wastes: WasteItem[];
  totalWeight: number;  // Max 10kg
  address: string;
  timeSlot: TimeSlot;
  status: CollectionStatus;
  notes?: string;
  collectorId?: string;
  collectorPhotos?: string[];
  verifiedWeight?: number;
  pointsAwarded?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointsConfig {
  plastic: 2,
  glass: 1,
  paper: 1,
  metal: 5
}

export interface RewardTier {
  points: number;
  value: number;
}

export const POINTS_CONFIG: PointsConfig = {
  plastic: 2,
  glass: 1,
  paper: 1,
  metal: 5
};

export const REWARD_TIERS: RewardTier[] = [
  { points: 100, value: 50 },
  { points: 200, value: 120 },
  { points: 500, value: 350 }
]; 