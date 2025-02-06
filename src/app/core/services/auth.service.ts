import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { Address, formatAddress } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers(): void {
    if (!localStorage.getItem(this.USERS_KEY)) {
      const defaultCollector: User = {
        id: '1',
        email: 'collector@recycleapp.com',
        firstName: 'Default',
        lastName: 'Collector',
        phoneNumber: '+212-666-123456',
        dateOfBirth: '1990-01-01',
        address: {
          street: '123 Main St',
          district: 'Downtown',
          city: 'Casablanca',
          postalCode: '20000'
        },
        role: 'collector'
      };

      localStorage.setItem(this.USERS_KEY, JSON.stringify([defaultCollector]));
    }
  }

  register(userData: Omit<User, 'id'>): Observable<User> {
    const users = this.getUsers();
    
    if (users.some(u => u.email === userData.email)) {
      return throwError(() => new Error('Email already exists'));
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };

    users.push(newUser);
    this.saveUsers(users);

    return of(newUser);
  }

  login(email: string, password: string): Observable<User> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    // In a real app, we would verify the password hash here
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    return of(user);
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  updateUser(userId: string, updates: Partial<User>): Observable<User> {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      return throwError(() => new Error('User not found'));
    }

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    this.saveUsers(users);

    // Update current user if it's the same user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }

    return of(updatedUser);
  }

  updateProfile(userId: string, userData: Partial<User>): Observable<User> {
    return this.updateUser(userId, userData);
  }

  private getUsers(): User[] {
    const usersStr = localStorage.getItem(this.USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  deleteAccount(userId: string): Observable<void> {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      return throwError(() => new Error('User not found'));
    }

    users.splice(index, 1);
    this.saveUsers(users);
    this.logout();
    return of(void 0);
  }
} 