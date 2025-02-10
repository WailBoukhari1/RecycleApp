import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Voucher } from '../../../../core/models/points.model';
import { AuthService } from '../../../../core/services/auth.service';
import * as PointsActions from '../../store/points.actions';
import * as PointsSelectors from '../../store/points.selectors';

@Component({
  selector: 'app-voucher-list',
  templateUrl: './voucher-list.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class VoucherListComponent implements OnInit {
  vouchers$: Observable<Voucher[]>;

  constructor(
    private store: Store,
    private authService: AuthService
  ) {
    this.vouchers$ = this.store.select(PointsSelectors.selectSortedVouchers);
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.store.dispatch(PointsActions.loadUserPoints({ userId: currentUser.id }));
    }
  }
} 