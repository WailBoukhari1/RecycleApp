import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WasteType } from '../../../../core/models/collection.model';

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
      @apply border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500;
    }
  `]
})
export class CreateRequestComponent {
  requestForm: FormGroup;
  wasteTypes: WasteType[] = ['plastic', 'paper', 'glass', 'metal', 'organic', 'electronic'];
  selectedPhotos: File[] = [];

  constructor(private fb: FormBuilder) {
    this.requestForm = this.fb.group({
      wasteType: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      notes: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedPhotos = Array.from(input.files);
    }
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      const formData = {
        ...this.requestForm.value,
        photos: this.selectedPhotos
      };
      console.log('Form submitted:', formData);
      // TODO: Dispatch create collection request action
    }
  }
} 