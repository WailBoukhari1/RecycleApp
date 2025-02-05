import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../../features/auth/store/auth.selectors';


@Component({
  selector: 'app-collector-dashboard',
  template: `
    <div class="container mx-auto px-4 py-8">
      <mat-card>
        <mat-card-header>
          <mat-card-title class="text-2xl font-bold">
            Collection Requests in {{ (currentUser$ | async)?.address }}
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="mt-6">
          <!-- Collection requests list will go here -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Placeholder for collection request cards -->
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class CollectorDashboardComponent {
  currentUser$ = this.store.select(selectAuthUser);

  constructor(private store: Store) {}
}
