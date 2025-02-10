import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authService.getCurrentUser();
    const requiredRole = route.data['role'] as UserRole;
    
    if (!currentUser) {
      this.snackBar.open('Please log in to access this page', 'Close', { duration: 3000 });
      return this.router.createUrlTree(['/auth/login']);
    }

    if (requiredRole && currentUser.role !== requiredRole) {
      this.snackBar.open(`This page is only accessible to ${requiredRole}s`, 'Close', { duration: 3000 });
      return this.router.createUrlTree(['/dashboard']);
    }

    if (!this.isProfileComplete(currentUser)) {
      this.snackBar.open(
        'Please complete your profile to access all features', 
        'Go to Profile',
        { duration: 5000 }
      ).onAction().subscribe(() => {
        this.router.navigate(['/profile']);
      });
      return this.router.createUrlTree(['/profile']);
    }

    return true;
  }

  private isProfileComplete(user: any): boolean {
    return !!(
      user.phoneNumber &&
      user.dateOfBirth &&
      user.address?.street &&
      user.address?.district &&
      user.address?.city &&
      user.address?.postalCode
    );
  }
} 