export type WasteType = 'plastic' | 'glass' | 'paper' | 'metal';
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
  userId: string;
  userAddress: string;
  userCity: string;
  wastes: WasteItem[];
  totalWeight: number;  // in grams, minimum 1000g
  collectionAddress: string;
  date: string;
  timeSlot: string;  // Format: "HH:mm" between 09:00 and 18:00
  notes?: string;
  photos?: string[];
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  collectorId?: string;
  collectorPhotos?: string[];
  verifiedWeight?: number;
  pointsAwarded?: number;
}

// Points configuration per kg
export const POINTS_CONFIG = {
  plastic: 2,
  glass: 1,
  paper: 1,
  metal: 5
} as const;

// Reward tiers configuration
export const REWARD_TIERS = [
  { points: 100, value: 50 },   // 50 Dh
  { points: 200, value: 120 },  // 120 Dh
  { points: 500, value: 350 }   // 350 Dh
] as const;

// Collection request constraints
export const COLLECTION_CONSTRAINTS = {
  MIN_WEIGHT_GRAMS: 1000,
  MAX_TOTAL_WEIGHT_KG: 10,
  MAX_PENDING_REQUESTS: 3,
  TIME_SLOT_START: '09:00',
  TIME_SLOT_END: '18:00'
} as const;

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