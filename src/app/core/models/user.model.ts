export interface User {
  id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  birthDate: string;
  profileImage?: string;
  userType: 'collector' | 'individual';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
} 