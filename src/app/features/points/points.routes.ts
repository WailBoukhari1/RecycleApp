import { Routes } from '@angular/router';
import { PointsComponent } from './components/points/points.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const pointsRoutes: Routes = [
  {
    path: '',
    component: PointsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'individual' }
  }
]; 