import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { PointsService, RewardVoucher } from '../../../../core/services/points.service';
import { REWARD_TIERS } from '../../../../core/models/collection.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Observable, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-individual-dashboard',
  template: `
    <div class="space-y-6">
      <!-- Points Overview -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>My Points</mat-card-title>
        </mat-card-header>
        <mat-card-content class="p-6">
          <div class="text-4xl font-bold text-blue-600">
            {{ getUserPoints() }} points
          </div>
          <p class="text-gray-600 mt-2">
            Earn points by recycling materials and redeem them for rewards!
          </p>
        </mat-card-content>
      </mat-card>

      <!-- Reward Tiers -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Available Rewards</mat-card-title>
        </mat-card-header>
        <mat-card-content class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div *ngFor="let tier of rewardTiers" 
                 class="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div class="text-xl font-bold">{{ tier.value }} Dh</div>
              <div class="text-gray-600">{{ tier.points }} points</div>
              <button mat-raised-button color="primary"
                      class="mt-4 w-full"
                      [disabled]="getUserPoints() < tier.points"
                      (click)="redeemPoints(tier)">
                Redeem
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- My Vouchers -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>My Vouchers</mat-card-title>
        </mat-card-header>
        <mat-card-content class="p-6">
          <div class="space-y-4">
            <div *ngFor="let voucher of vouchers$ | async" 
                 class="p-4 border rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-lg font-bold">{{ voucher.value }} Dh</div>
                  <div class="text-gray-600">Redeemed {{ voucher.points }} points</div>
                  <div class="text-sm text-gray-500">
                    {{ voucher.createdAt | date }}
                  </div>
                </div>
                <div class="text-xl font-mono bg-gray-100 p-2 rounded">
                  {{ voucher.code }}
                </div>
              </div>
            </div>
            <div *ngIf="!(vouchers$ | async)?.length" 
                 class="text-center text-gray-500 py-8">
              No vouchers yet. Start redeeming your points!
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
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

  constructor(
    private authService: AuthService,
    private collectionService: CollectionService,
    private pointsService: PointsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.vouchers$ = this.pointsService.getUserVouchers();
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