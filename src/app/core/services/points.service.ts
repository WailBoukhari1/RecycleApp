import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {  REWARD_TIERS } from '../models/collection.model';

export interface RewardVoucher {
  id: string;
  userId: string;
  points: number;
  value: number;
  createdAt: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class PointsService {
  private readonly VOUCHERS_KEY = 'vouchers';

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.initializeVouchers();
  }

  private initializeVouchers(): void {
    if (!localStorage.getItem(this.VOUCHERS_KEY)) {
      localStorage.setItem(this.VOUCHERS_KEY, JSON.stringify([]));
    }
  }

  private getVouchers(): RewardVoucher[] {
    const vouchersStr = localStorage.getItem(this.VOUCHERS_KEY);
    return vouchersStr ? JSON.parse(vouchersStr) : [];
  }

  private saveVouchers(vouchers: RewardVoucher[]): void {
    localStorage.setItem(this.VOUCHERS_KEY, JSON.stringify(vouchers));
  }

  getUserVouchers(): Observable<RewardVoucher[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    const vouchers = this.getVouchers().filter(v => v.userId === currentUser.id);
    return of(vouchers);
  }

  redeemPoints(points: number): Observable<RewardVoucher> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    if (!currentUser.points || currentUser.points < points) {
      return throwError(() => new Error('Insufficient points'));
    }

    const tier = REWARD_TIERS.find(t => t.points === points);
    if (!tier) {
      return throwError(() => new Error('Invalid points amount'));
    }

    const updatedPoints = currentUser.points - points;

    // First update the user's points
    return this.authService.updateUser(currentUser.id, {
      points: updatedPoints
    }).pipe(
      switchMap(() => {
        const voucher: RewardVoucher = {
          id: Date.now().toString(),
          userId: currentUser.id,
          points: points,
          value: tier.value,
          createdAt: new Date().toISOString(),
          code: this.generateVoucherCode()
        };

        const vouchers = this.getVouchers();
        vouchers.push(voucher);
        this.saveVouchers(vouchers);

        this.snackBar.open(
          `Successfully redeemed ${points} points for a ${tier.value} Dh voucher!`,
          'Close',
          { duration: 5000 }
        );

        return of(voucher);
      })
    );
  }

  private generateVoucherCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
} 