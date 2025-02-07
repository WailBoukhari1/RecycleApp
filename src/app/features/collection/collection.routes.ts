import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { CreateRequestComponent } from './components/create-request/create-request.component';
import { RequestListComponent } from './components/request-list/request-list.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { CollectorRequestsComponent } from './components/collector-requests/collector-requests.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RequestResolver } from '../../core/resolvers/request.resolver';

export const collectionRoutes: Routes = [
  {
    path: '',
    redirectTo: 'my-requests',
    pathMatch: 'full'
  },
  {
    path: 'my-requests',
    component: RequestListComponent,
    canActivate: [RoleGuard],
    data: { role: 'individual' }
  },
  {
    path: 'available',
    component: RequestListComponent,
    canActivate: [RoleGuard],
    data: { role: 'collector' }
  },
  {
    path: 'create',
    component: CreateRequestComponent,
    canActivate: [RoleGuard],
    data: { role: 'individual' },
    resolve: { request: RequestResolver }
  },
  {
    path: 'detail/:id',
    component: RequestDetailComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:id',
    component: CreateRequestComponent,
    canActivate: [RoleGuard],
    data: { role: 'individual' },
    resolve: { request: RequestResolver }
  },
  {
    path: 'my-collections',
    component: CollectorRequestsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'collector' }
  }
]; 