import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as AuthActions from './features/auth/store/auth.actions';

@Component({
  selector: 'app-root',
  template: `

    <app-navbar *ngIf="!isAuthRoute"></app-navbar>
    <router-outlet></router-outlet>
    <app-footer *ngIf="!isAuthRoute"></app-footer>
  `,

  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    ::ng-deep {
      .mat-mdc-snack-bar-container {
        &.success-snackbar {
          --mdc-snackbar-container-color: #4caf50;
          --mat-mdc-snack-bar-button-color: #fff;
          --mdc-snackbar-supporting-text-color: #fff;
        }

        &.error-snackbar {
          --mdc-snackbar-container-color: #f44336;
          --mat-mdc-snack-bar-button-color: #fff;
          --mdc-snackbar-supporting-text-color: #fff;
        }
      }
    }
  `]
})
export class AppComponent {
  isAuthRoute = false;

  constructor(private router: Router, private store: Store) {
    // Subscribe to router events to check if we're on an auth route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthRoute = event.url.includes('/auth');
    });

    this.store.dispatch(AuthActions.initAuth());
  }
}
