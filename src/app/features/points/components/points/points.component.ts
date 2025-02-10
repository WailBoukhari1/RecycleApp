import { Component, OnInit, OnDestroy } from '@angular/core';
import { async, Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PointsService } from '../../../../core/services/points.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { REWARD_TIERS } from '../../../../core/models/points.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html'
})
export class PointsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  balance$: Observable<number>;
  rewardTiers = REWARD_TIERS;

  constructor(
    private pointsService: PointsService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.balance$ = this.pointsService.balance$;
  }

  ngOnInit(): void {
    this.pointsService.refreshUserBalance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  redeemPoints(tier: { points: number; value: number }): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Redeem Points',
        message: `Are you sure you want to redeem ${tier.points} points for a ${tier.value} Dh voucher?`,
        confirmText: 'Redeem',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.pointsService.redeemPoints(tier.points).subscribe({
          error: (error) => {
            this.notificationService.error(error.message);
          }
        });
      }
    });
  }

  getDisabled(points: number): Observable<boolean> {
    return this.balance$.pipe(
      map(balance => balance === null || (balance || 0) < points)
    );
  }
} 