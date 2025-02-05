import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../features/auth/store/auth.selectors';

@Component({
  selector: 'app-individual-dashboard',
  templateUrl: './individual-dashboard.component.html',
  styles: [`
    :host {
      @apply block min-h-screen bg-gray-50;
    }
    mat-card {
      @apply p-6;
    }
  `]
})
export class IndividualDashboardComponent {
  user$ = this.store.select(selectAuthUser);

  constructor(
    private store: Store,
    private router: Router
  ) {}

  navigateToCreateRequest(): void {
    this.router.navigate(['/collection/create']);
  }

  navigateToRequests(): void {
    this.router.navigate(['/collection/my-requests']);
  }
}