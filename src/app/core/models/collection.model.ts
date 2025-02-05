export type WasteType = 'plastic' | 'paper' | 'glass' | 'metal';
export type RequestStatus = 'pending' | 'occupied' | 'in_progress' | 'validated' | 'rejected';

export interface TimeSlot {
  date: string;
  startTime: string;  // Between 09:00 and 18:00
  endTime: string;
}

export interface WasteItem {
  type: WasteType;
  weight: number;  // in grams
  photos?: string[];
}

export interface CollectionRequest {
  id?: string;
  userId?: string;
  userCity?: string;
  wastes: WasteItem[];
  totalWeight: number;  // in grams
  address: string;
  city: string;
  date: string;
  timeSlot: string;
  notes?: string;
  photos?: File[];
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  collectorId?: string;
  collectorPhotos?: string[];
  verifiedWeight?: number;
  pointsAwarded?: number;
}

export interface PointsConfig {
  [key: string]: number;
  plastic: 2;
  glass: 1;
  paper: 1;
  metal: 5;
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

export interface WasteTypePoints {
  plastic: number;
  paper: number;
  glass: number;
  metal: number;
}

export const POINTS_PER_KG: WasteTypePoints = {
  plastic: 2,
  paper: 1,
  glass: 1,
  metal: 5
}; 