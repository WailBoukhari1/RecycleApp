import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers(): void {
    if (!localStorage.getItem(this.USERS_KEY)) {
      const defaultCollectors: User[] = [
        {
          id: '1',
          email: 'collector1@recyclehub.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Collector',
          address: 'Casablanca, Morocco',
          phone: '+212600000001',
          birthDate: '1990-01-01',
          userType: 'collector'
        }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultCollectors));
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  login(email: string, password: string): Observable<User> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return of(user);
    }
    return throwError(() => new Error('Invalid credentials'));
  }

  register(userData: Omit<User, 'id' | 'userType'>): Observable<User> {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      userType: 'individual'
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
    return of(newUser);
  }

  clearSession(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  private getUsers(): User[] {
    const usersStr = localStorage.getItem(this.USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  updateProfile(userId: string, userData: Partial<User>): Observable<User> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }

    const updatedUser = {
      ...users[userIndex],
      ...userData
    };

    users[userIndex] = updatedUser;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
    
    return of(updatedUser);
  }

  deleteAccount(userId: string): Observable<void> {
    const users = this.getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.removeItem(this.CURRENT_USER_KEY);
    
    return of(void 0);
  }
} 