import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../features/auth/store/auth.selectors';
import * as AuthActions from '../../../features/auth/store/auth.actions';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
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
  user$ = this.store.select(selectAuthUser);

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