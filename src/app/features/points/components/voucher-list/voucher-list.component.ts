import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { RewardVoucher } from '../../../../core/services/points.service';
import { selectVouchers, selectPointsLoading } from '../../store/points.selectors';
import * as PointsActions from '../../store/points.actions';

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
  vouchers$: Observable<RewardVoucher[]>;
  loading$: Observable<boolean>;

  constructor(private store: Store) {
    this.vouchers$ = this.store.select(selectVouchers);
    this.loading$ = this.store.select(selectPointsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(PointsActions.loadVouchers());
  }
} 