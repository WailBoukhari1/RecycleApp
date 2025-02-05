import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from './features/auth/store/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
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
export class AppComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(AuthActions.initAuth());
  }
}
