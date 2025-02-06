import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { PointsService, RewardVoucher } from '../../../../core/services/points.service';
import { REWARD_TIERS } from '../../../../core/models/collection.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Observable, forkJoin, map } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../../../core/models/user.model';
import { RequestStatus } from '../../../../core/models/collection.model';

@Component({
  selector: 'app-individual-dashboard',
  templateUrl: './individual-dashboard.component.html',
  styles: [`
    :host {
      @apply block;
    }
  `]
})
export class IndividualDashboardComponent implements OnInit {
  currentUser: User | null = this.authService.getCurrentUser();
  rewardTiers = REWARD_TIERS;
  vouchers$: Observable<RewardVoucher[]>;
  user$: Observable<User | null>;
  validatedRequests$: Observable<number>;
  inProgressRequests$: Observable<number>;
  rejectedRequests$: Observable<number>;
  latestVouchers$: Observable<RewardVoucher[]>;

  constructor(
    private authService: AuthService,
    private collectionService: CollectionService,
    private pointsService: PointsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.vouchers$ = this.pointsService.getUserVouchers();
    this.user$ = this.authService.currentUser$;
    
    // Get request statistics
    const requests$ = this.collectionService.getUserRequests();
    
    this.validatedRequests$ = requests$.pipe(
      map(requests => requests.filter(r => r.status === 'validated').length)
    );

    this.inProgressRequests$ = requests$.pipe(
      map(requests => requests.filter(r => 
        r.status === 'in_progress' || r.status === 'occupied'
      ).length)
    );

    this.rejectedRequests$ = requests$.pipe(
      map(requests => requests.filter(r => r.status === 'rejected').length)
    );

    // Get latest 5 vouchers
    this.latestVouchers$ = this.pointsService.getUserVouchers().pipe(
      map(vouchers => vouchers.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5))
    );
  }

  getUserPoints(): number {
    return this.currentUser?.points || 0;
  }

  ngOnInit(): void {
    // Fetch and update points from validated requests
    if (this.currentUser) {
      this.collectionService.getUserRequests().subscribe(requests => {
        const validatedRequests = requests.filter(r => r.status === 'validated');
        let totalPoints = 0;
        
        validatedRequests.forEach(request => {
          if (request.pointsAwarded) {
            totalPoints += request.pointsAwarded;
          }
        });

        // Update user's points if they don't match the calculated total
        if (this.currentUser && this.currentUser.points !== totalPoints) {
          this.authService.updateUser(this.currentUser.id, { points: totalPoints }).subscribe(
            updatedUser => {
              this.currentUser = updatedUser;
              if (totalPoints > (this.currentUser?.points || 0)) {
                this.snackBar.open(
                  `Your points have been updated! You now have ${totalPoints} points.`,
                  'Close',
                  { duration: 5000 }
                );
              }
            }
          );
        }
      });
    }
  }

  redeemPoints(tier: { points: number; value: number }): void {
    if (!this.currentUser) {
      this.snackBar.open('Please log in to redeem points', 'Close', { duration: 3000 });
      return;
    }

    if (this.getUserPoints() < tier.points) {
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
            // Update the user's points
            const newPoints = this.getUserPoints() - tier.points;
            this.authService.updateUser(this.currentUser!.id, { points: newPoints }).subscribe(
              updatedUser => {
                this.currentUser = updatedUser;
                // Refresh vouchers list
                this.vouchers$ = this.pointsService.getUserVouchers();
                // Show success message
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