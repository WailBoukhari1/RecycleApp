import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="text-xl font-bold">{{data.title}}</h2>
    <div mat-dialog-content class="py-4">
      <p class="text-gray-600">{{data.message}}</p>
    </div>
    <div mat-dialog-actions align="end" class="space-x-2">
      <button mat-button 
              [matDialogClose]="false" 
              class="hover:bg-gray-100">
        {{data.cancelText}}
      </button>
      <button mat-raised-button 
              color="warn" 
              [matDialogClose]="true"
              class="hover:bg-red-700">
        {{data.confirmText}}
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1.5rem;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
