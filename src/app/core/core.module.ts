import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { LayoutModule } from './Layouts/Layout.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    LayoutModule
  ],
  exports: [
    LayoutModule
  ]
})
export class CoreModule { } 