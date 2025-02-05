import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { authGuard } from '../../core/guards/auth.guard';

export const homeRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard]
  }
]; 