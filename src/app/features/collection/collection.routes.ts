import { Routes } from '@angular/router';
import { CreateRequestComponent } from './components/create-request/create-request.component';
import { RequestListComponent } from './components/request-list/request-list.component';
import { AvailableCollectionsComponent } from './components/available-collections/available-collections.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { authGuard } from '../../core/guards/auth.guard';

export const collectionRoutes: Routes = [
  {
    path: 'create',
    component: CreateRequestComponent,
    canActivate: [authGuard],
    data: { requiredRole: 'individual' }
  },
  {
    path: 'my-requests',
    component: RequestListComponent,
    canActivate: [authGuard],
    data: { requiredRole: 'individual' }
  },
  {
    path: 'available',
    component: AvailableCollectionsComponent,
    canActivate: [authGuard],
    data: { requiredRole: 'collector' }
  },
  {
    path: 'detail/:id',
    component: RequestDetailComponent,
    canActivate: [authGuard]
  }
]; 