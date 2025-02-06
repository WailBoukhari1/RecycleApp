import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../../core/models/user.model';
import { RewardVoucher } from '../../../../core/services/points.service';
import { selectAuthUser } from '../../../auth/store/auth.selectors';
import * as AuthActions from '../../../auth/store/auth.actions';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PointsService } from '../../../../core/services/points.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
})
export class PointsComponent implements OnInit {
  currentUser$: Observable<User | null>;
  rewardTiers = [
    { points: 100, value: 50 },
    { points: 200, value: 120 },
    { points: 500, value: 350 }
  ];

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private pointsService: PointsService,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  redeemPoints(tier: { points: number; value: number }): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('Please log in to redeem points', 'Close', { duration: 3000 });
      return;
    }

    if (!currentUser.points || currentUser.points < tier.points) {
      this.snackBar.open(`You need ${tier.points} points to redeem this reward`, 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Redeem Points',
        message: `Are you sure you want to redeem ${tier.points} points for a ${tier.value} Dh reward voucher?`,
        confirmText: 'Redeem',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pointsService.redeemPoints(tier.points).subscribe({
          next: (voucher) => {
            // Update the current user with new points
            const updatedPoints = currentUser.points! - tier.points;
            this.authService.updateUser(currentUser.id, { points: updatedPoints }).subscribe(
              updatedUser => {
                this.snackBar.open(
                  `Successfully redeemed ${tier.points} points for a ${tier.value} Dh voucher!`,
                  'Close',
                  { duration: 5000 }
                );
              }
            );
          },
          error: (error) => {
            this.snackBar.open(
              error.message || 'Failed to redeem points. Please try again.',
              'Close',
              { duration: 3000 }
            );
          }
        });
      }
    });
  }
} 