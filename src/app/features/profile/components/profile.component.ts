import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../features/auth/store/auth.selectors';
import * as AuthActions from '../../../features/auth/store/auth.actions';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteAccountDialogComponent } from './delete-account-dialog.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: [`
    :host {
      @apply block bg-gray-50 min-h-screen py-8;
    }

    mat-form-field {
      @apply w-full;
    }

    .mat-mdc-card {
      @apply p-6;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser$ = this.store.select(selectAuthUser);

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      birthDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phoneNumber,
          address: user.address,
          birthDate: user.birthDate
        });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.store.dispatch(AuthActions.updateProfile({ userData: this.profileForm.value }));
    }
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-container'
    });

    dialogRef.afterClosed().pipe(
      filter(result => result === true)
    ).subscribe(() => {
      this.store.dispatch(AuthActions.deleteAccount());
      localStorage.clear();
      this.router.navigate(['/auth/login']);
    });
  }
} 