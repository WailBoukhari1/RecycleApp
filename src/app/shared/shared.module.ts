import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { AddressFormComponent } from './components/address-form/address-form.component';

@NgModule({
  declarations: [
    AddressFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    AddressFormComponent
  ]
})
export class SharedModule { } 
 