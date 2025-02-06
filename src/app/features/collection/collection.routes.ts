import { Routes } from '@angular/router';
import { ProfileCompletionGuard } from '../../core/guards/profile-completion.guard';
import { CollectorGuard } from '../../core/guards/collector.guard';
import { CreateRequestComponent } from './components/create-request/create-request.component';
import { RequestListComponent } from './components/request-list/request-list.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';

export const collectionRoutes: Routes = [
  {
    path: '',
    redirectTo: 'my-requests',
    pathMatch: 'full'
  },
  {
    path: 'my-requests',
    component: RequestListComponent,
    canActivate: [ProfileCompletionGuard],
    data: { role: 'individual' }
  },
  {
    path: 'available',
    component: RequestListComponent,
    canActivate: [ProfileCompletionGuard, CollectorGuard],
    data: { role: 'collector' }
  },
  {
    path: 'create',
    component: CreateRequestComponent,
    canActivate: [ProfileCompletionGuard],
    data: { role: 'individual' }
  },
  {
    path: 'detail/:id',
    component: RequestDetailComponent,
    canActivate: [ProfileCompletionGuard]
  },
  {
    path: 'edit/:id',
    component: CreateRequestComponent,
    canActivate: [ProfileCompletionGuard],
    data: { role: 'individual' }
  }
]; 