import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { IndividualDashboardComponent } from './components/individual-dashboard/individual-dashboard.component';
import { CollectorDashboardComponent } from './components/collector-dashboard/collector-dashboard.component';
import { dashboardRoutes } from './dashboard.routes';


@NgModule({
  declarations: [
    IndividualDashboardComponent,
    CollectorDashboardComponent
  ],

  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes),
    MaterialModule
  ],
  exports: [
    IndividualDashboardComponent,
    CollectorDashboardComponent
  ]

})
export class DashboardModule { } 