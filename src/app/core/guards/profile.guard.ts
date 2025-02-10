import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { ProfileComponent } from '../../features/profile/components/profile.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanDeactivate<ProfileComponent> {
  constructor(private snackBar: MatSnackBar) {}

  canDeactivate(component: ProfileComponent): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.isProfileComplete(component.getUser())) {
      this.snackBar.open('Please complete your profile before proceeding', 'OK', {
        duration: 3000
      });
      return false;
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