import { Routes } from '@angular/router';
import { IndividualDashboardComponent } from './components/individual-dashboard/individual-dashboard.component';
import { CollectorDashboardComponent } from './components/collector-dashboard/collector-dashboard.component';
import { authGuard } from '../../core/guards/auth.guard';


export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      {
        path: 'collector',
        component: CollectorDashboardComponent,
        data: { requiredRole: 'collector' }
      },
      {
        path: 'individual',
        component: IndividualDashboardComponent,
        data: { requiredRole: 'individual' }
      }
    ]
  }
]; 