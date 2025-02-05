import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WasteType, RequestStatus, CollectionRequest } from '../../../../core/models/collection.model';
import { selectPendingRequests } from '../../store/collection.selectors';
import { createCollectionRequest } from '../../store/collection.actions';
import { CollectionState } from '../../store/collection.reducer';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.component.html',
  styles: [`
    :host {
      @apply block p-6;
    }
    mat-form-field {
      @apply w-full;
    }
    .photo-upload {
      @apply border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors;
    }
  `]
})
export class CreateRequestComponent implements OnInit {
  requestForm!: FormGroup;
  wasteTypes: WasteType[] = ['plastic', 'paper', 'glass', 'metal'];
  selectedPhotos: File[] = [];
  pendingRequestsCount = 0;
  timeSlots: string[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store<{ collection: CollectionState }>,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initTimeSlots();
    this.createForm();
  }

  ngOnInit(): void {
    // Check number of pending requests
    this.store.select(selectPendingRequests).subscribe(requests => {
      this.pendingRequestsCount = requests.length;
      if (this.pendingRequestsCount >= 3) {
        this.snackBar.open('You have reached the maximum limit of 3 pending requests', 'Close', {
          duration: 5000
        });
        this.router.navigate(['/collection/my-requests']);
      }
    });
  }

  private createForm(): void {
    this.requestForm = this.fb.group({
      wasteTypes: [[], [Validators.required, Validators.minLength(1)]],
      weight: ['', [
        Validators.required, 
        Validators.min(1), // 1kg minimum
        Validators.max(10), // 10kg maximum
        Validators.pattern(/^\d*\.?\d*$/) // Only numbers and decimals
      ]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      date: ['', [Validators.required, this.futureDateValidator()]],
      timeSlot: ['', Validators.required],
      notes: ['']
    });
  }

  private initTimeSlots(): void {
    // Generate time slots between 09:00 and 18:00 with 1-hour intervals
    for (let hour = 9; hour < 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      this.timeSlots.push(`${startTime} - ${endTime}`);
    }
  }

  private futureDateValidator() {
    return (control: any) => {
      if (!control.value) {
        return null;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(control.value);
      inputDate.setHours(0, 0, 0, 0);
      return inputDate >= today ? null : { pastDate: true };
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      // Limit to 5 photos maximum
      const newPhotos = Array.from(input.files);
      if (this.selectedPhotos.length + newPhotos.length > 5) {
        this.snackBar.open('Maximum 5 photos allowed', 'Close', { duration: 3000 });
        return;
      }
      this.selectedPhotos = [...this.selectedPhotos, ...newPhotos];
    }
  }

  removePhoto(index: number): void {
    this.selectedPhotos = this.selectedPhotos.filter((_, i) => i !== index);
  }

  onSubmit(): void {
    if (this.requestForm.valid && this.pendingRequestsCount < 3) {
      const formData = {
        ...this.requestForm.value,
        status: 'pending' as RequestStatus,
        photos: this.selectedPhotos,
        createdAt: new Date().toISOString(),
        weight: Number(this.requestForm.value.weight) * 1000 // Convert to grams
      };

      // Validate total weight (minimum 1000g)
      if (formData.weight < 1000) {
        this.snackBar.open('Minimum weight should be 1kg (1000g)', 'Close', {
          duration: 3000
        });
        return;
      }

      // Validate total weight (maximum 10kg/10000g)
      if (formData.weight > 10000) {
        this.snackBar.open('Maximum weight should be 10kg (10000g)', 'Close', {
          duration: 3000
        });
        return;
      }

      this.store.dispatch(createCollectionRequest({ request: formData }));
      this.router.navigate(['/collection/my-requests']);
      this.snackBar.open('Collection request created successfully', 'Close', {
        duration: 3000
      });
    }
  }
} 