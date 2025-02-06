import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../../core/models/user.model';
import { RewardVoucher } from '../../../../core/services/points.service';
import { selectAuthUser } from '../../../auth/store/auth.selectors';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import * as PointsActions from '../../store/points.actions';
import * as PointsSelectors from '../../store/points.selectors';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
})
export class PointsComponent implements OnInit {
  currentUser$: Observable<User | null>;
  points$: Observable<number>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  rewardTiers = [
    { points: 100, value: 50 },
    { points: 200, value: 120 },
    { points: 500, value: 350 }
  ];

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.currentUser$ = this.store.select(selectAuthUser);
    this.points$ = this.store.select(PointsSelectors.selectPoints);
    this.loading$ = this.store.select(PointsSelectors.selectPointsLoading);
    this.error$ = this.store.select(PointsSelectors.selectPointsError);
  }

  ngOnInit(): void {
    this.store.dispatch(PointsActions.loadPoints());
    this.store.dispatch(PointsActions.loadVouchers());
  }

  redeemPoints(tier: { points: number; value: number }): void {
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
        this.store.dispatch(PointsActions.redeemPoints({ points: tier.points, value: tier.value }));
      }
    });
  }
} 