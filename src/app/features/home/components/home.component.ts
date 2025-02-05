import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../features/auth/store/auth.selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  currentUser$ = this.store.select(selectAuthUser);

  constructor(private store: Store) {}
} 