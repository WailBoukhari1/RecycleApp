export interface User {
  id: string;
  email: string;
  password: string;
  role: 'collector' | 'individual';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  birthDate?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
} 