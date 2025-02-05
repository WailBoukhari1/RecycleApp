import { Routes } from '@angular/router';
import { ProfileComponent } from './components/profile.component';
import { authGuard } from '../../core/guards/auth.guard';

export const profileRoutes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    canActivate: [authGuard]
  }
];
