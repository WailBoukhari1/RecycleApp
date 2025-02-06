import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="container mx-auto p-6">
      <!-- Individual Dashboard -->
      <ng-container *ngIf="currentUser?.role === 'individual'">
        <app-individual-dashboard></app-individual-dashboard>
      </ng-container>

      <!-- Collector Dashboard -->
      <ng-container *ngIf="currentUser?.role === 'collector'">
        <app-collector-dashboard></app-collector-dashboard>
      </ng-container>
    </div>
  `,
  styles: [`
    :host {
      @apply block min-h-screen bg-gray-50;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
} 