import { Routes } from '@angular/router';
import { IndividualDashboardComponent } from './components/individual-dashboard/individual-dashboard.component';
import { CollectorDashboardComponent } from './components/collector-dashboard/collector-dashboard.component';
import { roleGuard } from '../../core/guards/role.guard';
import { checkRoleGuard } from '../../core/guards/check-role.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    children: [
      { 
        path: '', 
        canActivate: [roleGuard],
        component: IndividualDashboardComponent
      },
      {
        path: 'collector',
        component: CollectorDashboardComponent,
        canActivate: [checkRoleGuard],
        data: { requiredRole: 'collector' }
      },
      {
        path: 'individual',
        component: IndividualDashboardComponent,
        canActivate: [checkRoleGuard],
        data: { requiredRole: 'individual' }
      }
    ]
  }
]; 