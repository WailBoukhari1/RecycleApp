import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../../shared/shared.module';

import { PointsComponent } from './components/points/points.component';
import { PointsHistoryComponent } from './components/points-history/points-history.component';
import { VoucherListComponent } from './components/voucher-list/voucher-list.component';
import { pointsReducer } from './store/points.reducer';
import { PointsEffects } from './store/points.effects';
import { pointsRoutes } from './points.routes';

@NgModule({
  declarations: [
    PointsComponent,
    PointsHistoryComponent,
    VoucherListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(pointsRoutes),
    StoreModule.forFeature('points', pointsReducer),
    EffectsModule.forFeature([PointsEffects])
  ]
})
export class PointsModule { } 