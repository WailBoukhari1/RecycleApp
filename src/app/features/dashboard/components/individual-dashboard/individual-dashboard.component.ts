import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../auth/store/auth.selectors';


@Component({
  selector: 'app-individual-dashboard',
  template: `
    <div class="dashboard-container">
      <section class="request-form">
        <h2>New Collection Request</h2>
        <button class="create-request" (click)="createRequest()">
          Create New Request
        </button>
      </section>

      <section class="my-requests">
        <h2>My Requests</h2>
        <!-- Requests list -->
      </section>

      <section class="points-section">
        <h2>My Recycling Points</h2>
        <div class="points-info">
          <p>Available Points: 0</p>
          <button class="redeem-btn">Redeem Points</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `]
})
export class IndividualDashboardComponent {
  currentUser$ = this.store.select(selectAuthUser);
  

  constructor(private store: Store) {}

  createRequest(): void {
    // To be implemented
  }
}