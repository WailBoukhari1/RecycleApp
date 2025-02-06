import { Address } from './address.model';

export type UserRole = 'individual' | 'collector';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;  // Format: +212-XXX-XXXXXX
  dateOfBirth: string;
  address: Address;
  role: UserRole;
  photoUrl?: string;
  points?: number;  // For individuals only
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +212-XXX-XXXXXX
  if (cleaned.length === 9) { // Moroccan format without country code
    return `+212-${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('212')) { // With country code
    return `+${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone; // Return as is if not matching expected format
}

export function validatePhoneNumber(phone: string): boolean {
  // Accept format: +212-XXX-XXXXXX or 0XXXXXXXXX
  const regex = /^(\+212-\d{3}-\d{6}|0\d{9})$/;
  return regex.test(phone);
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
} 