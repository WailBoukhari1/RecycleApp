import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../features/auth/store/auth.selectors';
import * as AuthActions from '../../../features/auth/store/auth.actions';


@Component({
  selector: 'app-navbar',
  template: `
    <header class="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="bg-blue-600 p-2 rounded-lg">
              <mat-icon class="text-white">recycling</mat-icon>
            </div>
            <span class="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              RecycleHub
            </span>
          </div>

          <!-- Navigation -->
          <nav class="hidden lg:flex items-center gap-6">
            <div class="h-8 w-px bg-gray-200"></div>

            <div class="flex items-center gap-4" *ngIf="currentUser$ | async as user">
              <button 
                [matMenuTriggerFor]="profileMenu"
                class="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <div class="h-10 w-10 rounded-full bg-blue-100 grid place-items-center">
                  <mat-icon class="text-blue-600">person</mat-icon>
                </div>
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-900">
                    {{ user.firstName }} {{ user.lastName }}
                  </span>
                  <span class="text-xs text-gray-500 capitalize">{{ user.userType }}</span>
                </div>
              </button>

              <mat-menu #profileMenu="matMenu">
                <div class="py-1">
                  <button mat-menu-item (click)="navigateToProfile()">
                    <mat-icon>account_circle</mat-icon>
                    <span>Profile</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="logout()" class="text-red-600">
                    <mat-icon>logout</mat-icon>
                    <span>Logout</span>
                  </button>
                </div>
              </mat-menu>
            </div>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      @apply block;
    }

    ::ng-deep {
      .mat-mdc-menu-panel {
        @apply rounded-lg shadow-lg;
      }

      .mat-mdc-menu-content {
        @apply p-0;
      }

      .mat-mdc-menu-item {
        @apply min-h-0;
      }

      .mat-icon {
        @apply grid place-items-center h-6 w-6;
      }
    }
  `]
})
export class NavbarComponent {
  currentUser$ = this.store.select(selectAuthUser);

  constructor(
    private store: Store,
    private router: Router
  ) {}

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}