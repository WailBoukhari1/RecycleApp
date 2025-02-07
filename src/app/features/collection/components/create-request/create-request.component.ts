import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WasteType, RequestStatus, CollectionRequest, COLLECTION_CONSTRAINTS } from '../../../../core/models/collection.model';
import { createCollectionRequest } from '../../store/collection.actions';
import { CollectionState } from '../../store/collection.reducer';
import { selectAllRequests } from '../../store/collection.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CollectionService } from '../../../../core/services/collection.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

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
  isEditing = false;
  editingId: string | null = null;
  wasteTypes: WasteType[] = ['plastic', 'glass', 'paper', 'metal'];
  selectedPhotos: string[] = [];
  pendingRequestsCount = 0;
  timeSlots: string[] = [];
  maxWeightPerRequest = COLLECTION_CONSTRAINTS.MAX_TOTAL_WEIGHT_KG;
  readonly COLLECTION_CONSTRAINTS = COLLECTION_CONSTRAINTS;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<{ collection: CollectionState }>,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private collectionService: CollectionService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.initTimeSlots();
    this.requestForm = this.createForm();
  }

  ngOnInit(): void {
    // Get resolved data
    const resolvedRequest = this.route.snapshot.data['request'];
    if (resolvedRequest) {
      this.isEditing = true;
      this.editingId = resolvedRequest.id;
      this.patchForm(resolvedRequest);
    }

    // Check number of pending requests
    this.store.select(selectAllRequests).pipe(
      map(requests => requests.filter(r => r.status === 'pending')),
      takeUntil(this.destroy$)
    ).subscribe(pendingRequests => {
      this.pendingRequestsCount = pendingRequests.length;
      
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
      this.validateTotalWeight();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      wastes: this.fb.array([]),
      collectionAddress: ['', Validators.required],
      date: ['', [Validators.required, this.futureDateValidator()]],
      timeSlot: ['', [Validators.required, this.timeSlotValidator()]],
      notes: ['']
    });
  }

  private patchForm(request: CollectionRequest): void {
    // Clear existing wastes
    while (this.wastes.length) {
      this.wastes.removeAt(0);
    }

    // Add each waste
    request.wastes.forEach(waste => {
      this.wastes.push(this.fb.group({
        type: [waste.type, Validators.required],
        weight: [waste.weight / 1000, [Validators.required, Validators.min(0.1)]], // Convert from g to kg
        photos: [waste.photos || []]
      }));
    });

    // Patch other fields
    this.requestForm.patchValue({
      collectionAddress: request.collectionAddress,
      date: request.date,
      timeSlot: request.timeSlot,
      notes: request.notes
    });
  }

  private validateTotalWeight(): void {
    const totalWeight = this.calculateTotalWeight();
    
    if (totalWeight > COLLECTION_CONSTRAINTS.MAX_TOTAL_WEIGHT_KG) {
      this.snackBar.open(
        `Total weight (${totalWeight.toFixed(1)}kg) exceeds the maximum limit of ${COLLECTION_CONSTRAINTS.MAX_TOTAL_WEIGHT_KG}kg per request`, 
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

      if (totalWeight > COLLECTION_CONSTRAINTS.MAX_TOTAL_WEIGHT_KG) {
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
        Validators.max(COLLECTION_CONSTRAINTS.MAX_TOTAL_WEIGHT_KG)
      ]],
      photos: [[]]
    }));
  }

  removeWasteItem(index: number): void {
    const wastes = this.wastes;
    wastes.removeAt(index);
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
    if (this.requestForm.invalid) {
      this.notificationService.error('Please fill all required fields correctly');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.error('You must be logged in to create a request');
      return;
    }

    const formValue = this.requestForm.value;
    const request = {
      ...formValue,
      wastes: formValue.wastes.map((w: any) => ({
        ...w,
        weight: w.weight * 1000 // Convert kg to g
      })),
      totalWeight: formValue.wastes.reduce((sum: number, w: any) => sum + (w.weight * 1000), 0)
    };

    if (this.isEditing && this.editingId) {
      this.collectionService.updateRequest(this.editingId, request).subscribe({
        next: () => {
          this.notificationService.success('Request updated successfully');
          this.router.navigate(['/collection/my-requests']);
        },
        error: (error) => {
          this.notificationService.error(error.message || 'Failed to update request');
        }
      });
    } else {
      this.collectionService.createRequest(request).subscribe({
        next: () => {
          this.notificationService.success('Request created successfully');
          this.router.navigate(['/collection/my-requests']);
        },
        error: (error) => {
          this.notificationService.error(error.message || 'Failed to create request');
        }
      });
    }
  }

  get wastes() {
    return this.requestForm.get('wastes') as FormArray;
  }
} 