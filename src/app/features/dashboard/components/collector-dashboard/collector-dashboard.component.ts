import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../features/auth/store/auth.selectors';

@Component({
  selector: 'app-collector-dashboard',
  templateUrl: './collector-dashboard.component.html',
  styles: [`
    :host {
      @apply block min-h-screen bg-gray-50;
    }
    mat-card {
      @apply p-6;
    }
  `]
})
export class CollectorDashboardComponent {
  user$ = this.store.select(selectAuthUser);

  constructor(
    private store: Store,
    private router: Router
  ) {}

  navigateToAvailableCollections(): void {
    this.router.navigate(['/collection/available']);
  }

  navigateToActiveCollections(): void {
    this.router.navigate(['/collection/active']);
  }
}
