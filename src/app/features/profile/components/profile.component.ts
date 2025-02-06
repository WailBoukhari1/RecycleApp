import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../../features/auth/store/auth.selectors';
import * as AuthActions from '../../../features/auth/store/auth.actions';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteAccountDialogComponent } from './delete-account-dialog.component';
import { filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

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

    .profile-photo {
      @apply w-32 h-32 rounded-full object-cover mx-auto mb-4;
    }

    .photo-upload {
      @apply cursor-pointer text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser$ = this.store.select(selectAuthUser);
  isProfileComplete = false;
  selectedPhoto: string | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+212-\d{3}-\d{6}$/)]],
      dateOfBirth: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        district: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
      }),
      photoUrl: ['']
    });
  }

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          photoUrl: user.photoUrl
        });
        this.selectedPhoto = user.photoUrl || null;
        this.checkProfileCompletion();
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPhoto = reader.result as string;
        this.profileForm.patchValue({ photoUrl: this.selectedPhoto });
      };
      reader.readAsDataURL(file);
    }
  }

  checkProfileCompletion(): void {
    const requiredFields = ['phoneNumber', 'dateOfBirth', 'address'];
    const addressFields = ['street', 'district', 'city', 'postalCode'];
    
    this.isProfileComplete = requiredFields.every(field => {
      if (field === 'address') {
        return addressFields.every(addr => 
          this.profileForm.get(`address.${addr}`)?.value
        );
      }
      return this.profileForm.get(field)?.value;
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.store.dispatch(AuthActions.updateProfile({ userData: this.profileForm.value }));
      this.checkProfileCompletion();
      this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
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