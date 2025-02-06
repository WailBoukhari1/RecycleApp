import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.snackBar.open('Please log in to access the dashboard', 'Close', { duration: 3000 });
      return this.router.createUrlTree(['/auth/login']);
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