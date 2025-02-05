import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-account-dialog',
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-xl font-semibold text-gray-900">Delete Account</h2>
      
      <mat-dialog-content class="mt-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div class="flex items-center">
            <mat-icon class="text-red-500 mr-3">warning</mat-icon>
            <p class="text-red-700">This action cannot be undone.</p>
          </div>
        </div>
        <p class="text-gray-600">
          Are you sure you want to permanently delete your account? All your data will be removed immediately.
        </p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="mt-6 pt-4 border-t border-gray-200">
        <button mat-button mat-dialog-close class="mr-3">
          Cancel
        </button>
        <button 
          mat-flat-button 
          color="warn" 
          [mat-dialog-close]="true"
          class="bg-red-600 hover:bg-red-700">
          <mat-icon class="mr-2">delete_forever</mat-icon>
          Delete Account
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class DeleteAccountDialogComponent {} 