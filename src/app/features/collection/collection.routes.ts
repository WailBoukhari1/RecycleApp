import { Routes } from '@angular/router';
import { CreateRequestComponent } from './components/create-request/create-request.component';
import { RequestListComponent } from './components/request-list/request-list.component';
import { AvailableCollectionsComponent } from './components/available-collections/available-collections.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { checkRoleGuard } from '../../core/guards/check-role.guard';

export const collectionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create',
        component: CreateRequestComponent,
        canActivate: [checkRoleGuard],
        data: { requiredRole: 'individual' }
      },
      {
        path: 'my-requests',
        component: RequestListComponent,
        canActivate: [checkRoleGuard],
        data: { requiredRole: 'individual' }
      },
      {
        path: 'available',
        component: AvailableCollectionsComponent,
        canActivate: [checkRoleGuard],
        data: { requiredRole: 'collector' }
      },
      {
        path: 'detail/:id',
        component: RequestDetailComponent
      }
    ]
  }
]; 