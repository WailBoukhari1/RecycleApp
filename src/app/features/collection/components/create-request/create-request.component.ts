import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WasteType, RequestStatus, CollectionRequest, COLLECTION_CONSTRAINTS } from '../../../../core/models/collection.model';
import { createCollectionRequest } from '../../store/collection.actions';
import { CollectionState } from '../../store/collection.reducer';
import { selectAllRequests } from '../../store/collection.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
export class CreateRequestComponent implements OnInit, OnDestroy {
  requestForm!: FormGroup;
  wasteTypes: WasteType[] = ['plastic', 'glass', 'paper', 'metal'];
  selectedPhotos: string[] = [];
  pendingRequestsCount = 0;
  timeSlots: string[] = [];
  remainingWeightLimit: number = COLLECTION_CONSTRAINTS.MAX_TOTAL_WEIGHT_KG;
  readonly COLLECTION_CONSTRAINTS = COLLECTION_CONSTRAINTS;
  private destroy$ = new Subject<void>();

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
    this.store.select(selectAllRequests).pipe(
      map(requests => requests.filter(r => r.status === 'pending')),
      takeUntil(this.destroy$)
    ).subscribe(pendingRequests => {
      this.pendingRequestsCount = pendingRequests.length;
      
      // Calculate remaining weight limit from existing pending requests
      const totalPendingWeight = pendingRequests.reduce((sum, request) => 
        sum + (request.totalWeight / 1000), 0);
      this.remainingWeightLimit = Math.max(0, 
        COLLECTION_CONSTRAINTS.MAX_TOTAL_WEIGHT_KG - totalPendingWeight);

      // Update wastes form array validators
      this.updateWasteValidators();

      if (this.pendingRequestsCount >= COLLECTION_CONSTRAINTS.MAX_PENDING_REQUESTS) {
        this.snackBar.open(
          `You have reached the maximum limit of ${COLLECTION_CONSTRAINTS.MAX_PENDING_REQUESTS} pending requests`, 
          'Close', 
          { duration: 5000 }
        );
        this.router.navigate(['/collection/my-requests']);
      }
    });

    // Subscribe to weight changes for real-time validation
    this.wastes.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateWasteValidators();
      this.validateTotalWeight();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.requestForm = this.fb.group({
      wastes: this.fb.array([], [this.totalWeightValidator()]),
      collectionAddress: ['', Validators.required],
      date: ['', [Validators.required, this.futureDateValidator()]],
      timeSlot: ['', [Validators.required, this.timeSlotValidator()]],
      notes: ['']
    });

    // Add initial waste item
    this.addWasteItem();
  }

  private updateWasteValidators(): void {
    const wastesArray = this.wastes;
    const totalWeight = this.calculateTotalWeight();
    const remainingWeight = COLLECTION_CONSTRAINTS.MAX_TOTAL_WEIGHT_KG - totalWeight;

    wastesArray.controls.forEach(control => {
      const currentWeight = Number(control.get('weight')?.value) || 0;
      const maxWeight = Math.min(10, remainingWeight + currentWeight); // Max 10kg per request

      control.get('weight')?.setValidators([
        Validators.required,
        Validators.min(COLLECTION_CONSTRAINTS.MIN_WEIGHT_GRAMS / 1000),
        Validators.max(maxWeight)
      ]);
      control.get('weight')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private validateTotalWeight(): void {
    const totalWeight = this.calculateTotalWeight();
    
    if (totalWeight > 10) {
      this.snackBar.open(
        `Total weight (${totalWeight.toFixed(1)}kg) exceeds the maximum limit of 10kg`, 
        'Close',
        { duration: 3000 }
      );
    } else if (totalWeight * 1000 < COLLECTION_CONSTRAINTS.MIN_WEIGHT_GRAMS) {
      this.snackBar.open(
        `Total weight (${totalWeight.toFixed(1)}kg) is below the minimum of ${COLLECTION_CONSTRAINTS.MIN_WEIGHT_GRAMS / 1000}kg`, 
        'Close',
        { duration: 3000 }
      );
    }
  }

  private totalWeightValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const wastes = control as FormArray;
      const totalWeight = wastes.controls.reduce((sum, wasteControl) => {
        return sum + (Number(wasteControl.get('weight')?.value) || 0);
      }, 0);

      if (totalWeight > 10) {
        return { maxTotalWeight: true };
      }

      if (totalWeight * 1000 < COLLECTION_CONSTRAINTS.MIN_WEIGHT_GRAMS) {
        return { minTotalWeight: true };
      }

      return null;
    };
  }

  private initTimeSlots(): void {
    const startHour = parseInt(COLLECTION_CONSTRAINTS.TIME_SLOT_START.split(':')[0]);
    const endHour = parseInt(COLLECTION_CONSTRAINTS.TIME_SLOT_END.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      this.timeSlots.push(`${startTime} - ${endTime}`);
    }
  }

  addWasteItem(): void {
    const wastes = this.wastes;
    wastes.push(this.fb.group({
      type: ['', Validators.required],
      weight: ['', [
        Validators.required,
        Validators.min(COLLECTION_CONSTRAINTS.MIN_WEIGHT_GRAMS / 1000),
        Validators.max(this.remainingWeightLimit)
      ]],
      photos: [[]]
    }));
  }

  removeWasteItem(index: number): void {
    const wastes = this.wastes;
    wastes.removeAt(index);
    this.updateWasteValidators();
  }

  private futureDateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(control.value);
      inputDate.setHours(0, 0, 0, 0);
      
      return inputDate >= today ? null : { pastDate: true };
    };
  }

  private timeSlotValidator() {
    return (control: any) => {
      if (!control.value) return null;
      
      const [startTime] = control.value.split(' - ');
      const [hours] = startTime.split(':').map(Number);
      
      const startLimit = parseInt(COLLECTION_CONSTRAINTS.TIME_SLOT_START.split(':')[0]);
      const endLimit = parseInt(COLLECTION_CONSTRAINTS.TIME_SLOT_END.split(':')[0]);
      
      return (hours >= startLimit && hours < endLimit) ? null : { invalidTimeSlot: true };
    };
  }

  onFileSelected(event: Event, wasteIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const wastes = this.wastes;
      const wasteItem = wastes.at(wasteIndex);
      const currentPhotos = wasteItem.get('photos')?.value || [];
      
      // Convert File objects to base64 strings
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            currentPhotos.push(reader.result);
            wasteItem.patchValue({ photos: currentPhotos });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removePhoto(wasteIndex: number, photoIndex: number): void {
    const wastes = this.wastes;
    const wasteItem = wastes.at(wasteIndex);
    const currentPhotos = [...wasteItem.get('photos')?.value];
    currentPhotos.splice(photoIndex, 1);
    wasteItem.patchValue({ photos: currentPhotos });
  }

  calculateTotalWeight(): number {
    return this.wastes.controls.reduce((total, control) => {
      return total + (Number(control.get('weight')?.value) || 0);
    }, 0);
  }

  onSubmit(): void {
    if (this.requestForm.valid && 
        this.pendingRequestsCount < COLLECTION_CONSTRAINTS.MAX_PENDING_REQUESTS) {
      
      const totalWeight = this.calculateTotalWeight();
      
      if (totalWeight > this.remainingWeightLimit) {
        this.snackBar.open(
          `Maximum allowed weight is ${this.remainingWeightLimit}kg for new requests`, 
          'Close',
          { duration: 3000 }
        );
        return;
      }

      if (totalWeight * 1000 < COLLECTION_CONSTRAINTS.MIN_WEIGHT_GRAMS) {
        this.snackBar.open(
          `Minimum total weight must be ${COLLECTION_CONSTRAINTS.MIN_WEIGHT_GRAMS / 1000}kg`, 
          'Close',
          { duration: 3000 }
        );
        return;
      }

      const formValue = this.requestForm.value;
      const request: CollectionRequest = {
        userId: 'current-user-id', // This should be injected from AuthService
        userAddress: 'current-user-address', // This should be injected from AuthService
        userCity: 'current-user-city', // This should be injected from AuthService
        wastes: formValue.wastes.map((w: any) => ({
          ...w,
          weight: w.weight * 1000 // Convert to grams
        })),
        totalWeight: totalWeight * 1000, // Convert to grams
        collectionAddress: formValue.collectionAddress,
        date: formValue.date,
        timeSlot: formValue.timeSlot,
        notes: formValue.notes || '',
        status: 'pending' as RequestStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.store.dispatch(createCollectionRequest({ request }));
      this.router.navigate(['/collection/my-requests']);
      this.snackBar.open('Collection request created successfully', 'Close', {
        duration: 3000
      });
    }
  }

  get wastes() {
    return this.requestForm.get('wastes') as FormArray;
  }
} 