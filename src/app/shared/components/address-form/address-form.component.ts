import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Address } from '../../../core/models/address.model';

@Component({
  selector: 'app-address-form',
  template: `
    <div [formGroup]="addressForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <mat-form-field class="w-full">
        <mat-label>Street Address</mat-label>
        <input matInput formControlName="street" placeholder="123 Main St">
        <mat-error *ngIf="addressForm.get('street')?.errors?.['required']">
          Street address is required
        </mat-error>
      </mat-form-field>

      <mat-form-field class="w-full">
        <mat-label>District</mat-label>
        <input matInput formControlName="district" placeholder="Downtown">
        <mat-error *ngIf="addressForm.get('district')?.errors?.['required']">
          District is required
        </mat-error>
      </mat-form-field>

      <mat-form-field class="w-full">
        <mat-label>City</mat-label>
        <input matInput formControlName="city" placeholder="Casablanca">
        <mat-error *ngIf="addressForm.get('city')?.errors?.['required']">
          City is required
        </mat-error>
      </mat-form-field>

      <mat-form-field class="w-full">
        <mat-label>Postal Code</mat-label>
        <input matInput formControlName="postalCode" placeholder="20000">
        <mat-error *ngIf="addressForm.get('postalCode')?.errors?.['required']">
          Postal code is required
        </mat-error>
        <mat-error *ngIf="addressForm.get('postalCode')?.errors?.['pattern']">
          Invalid postal code format
        </mat-error>
      </mat-form-field>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AddressFormComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  addressForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    // If parent form exists, add this form as a child
    if (this.parentForm) {
      this.parentForm.addControl('address', this.addressForm);
    }
  }

  get value(): Address {
    return this.addressForm.value;
  }

  set value(address: Address) {
    this.addressForm.patchValue(address);
  }

  isValid(): boolean {
    return this.addressForm.valid;
  }
} 