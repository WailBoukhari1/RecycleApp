import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionService } from '../../../../core/services/collection.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CollectionRequest, RequestStatus } from '../../../../core/models/collection.model';
import { User } from '../../../../core/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styles: [`
    :host {
      @apply block p-6;
    }
    .status-chip {
      @apply px-3 py-1 rounded-full text-sm font-medium;
    }
    .status-pending {
      @apply bg-yellow-100 text-yellow-800;
    }
    .status-occupied {
      @apply bg-blue-100 text-blue-800;
    }
    .status-in_progress {
      @apply bg-purple-100 text-purple-800;
    }
    .status-validated {
      @apply bg-green-100 text-green-800;
    }
    .status-rejected {
      @apply bg-red-100 text-red-800;
    }
  `]
})
export class RequestDetailComponent implements OnInit {
  request: CollectionRequest | null = null;
  currentUser: User | null = null;
  userRole: 'individual' | 'collector' = 'individual';
  verificationForm: FormGroup;
  selectedPhotos: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionService: CollectionService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.verificationForm = this.fb.group({
      verifiedWeight: ['', [Validators.required, Validators.min(0.1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.userRole = this.currentUser?.role || 'individual';

    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      this.loadRequest(requestId);
    }
  }

  private loadRequest(id: string): void {
    this.collectionService.getRequestById(id).subscribe({
      next: (request) => {
        this.request = request;
        if (request.verifiedWeight) {
          this.verificationForm.patchValue({
            verifiedWeight: request.verifiedWeight / 1000 // Convert to kg
          });
        }
      },
      error: (error) => {
        this.snackBar.open('Failed to load request details', 'Close', { duration: 3000 });
        this.router.navigate(['/collection/my-requests']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedPhotos = Array.from(input.files);
    }
  }

  updateStatus(newStatus: RequestStatus): void {
    if (!this.request?.id || !this.currentUser?.id) return;

    let dialogData = {
      title: '',
      message: '',
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    };

    switch (newStatus) {
      case 'occupied':
        dialogData.title = 'Accept Collection Request';
        dialogData.message = 'Are you sure you want to accept this collection request?';
        break;
      case 'in_progress':
        dialogData.title = 'Start Collection';
        dialogData.message = 'Confirm that you have arrived and are starting the collection process?';
        break;
      case 'validated':
        if (!this.verificationForm.valid) {
          this.snackBar.open('Please enter the verified weight', 'Close', { duration: 3000 });
          return;
        }
        dialogData.title = 'Validate Collection';
        dialogData.message = 'Confirm that all materials have been collected and verified?';
        dialogData.confirmText = 'Validate';
        break;
      case 'rejected':
        dialogData.title = 'Reject Collection';
        dialogData.message = 'Are you sure you want to reject this collection? This action cannot be undone.';
        dialogData.confirmText = 'Reject';
        break;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const verifiedWeight = this.verificationForm.get('verifiedWeight')?.value;
        this.collectionService.updateRequestStatus(
          this.request!.id!,
          newStatus,
          this.currentUser!.id,
          verifiedWeight ? verifiedWeight * 1000 : undefined, // Convert to grams
          this.selectedPhotos
        ).subscribe({
          next: (updatedRequest) => {
            this.request = updatedRequest;
            let message = '';
            switch (newStatus) {
              case 'occupied':
                message = 'Request accepted successfully';
                this.router.navigate(['/collection/my-collections']);
                break;
              case 'in_progress':
                message = 'Collection started';
                break;
              case 'validated':
                message = 'Collection validated successfully';
                this.router.navigate(['/collection/available']);
                break;
              case 'rejected':
                message = 'Collection rejected';
                this.router.navigate(['/collection/available']);
                break;
            }
            this.snackBar.open(message, 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Failed to update request status', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getStatusClass(status: RequestStatus): string {
    return `status-chip status-${status}`;
  }

  deleteRequest(): void {
    if (!this.request?.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Request',
        message: 'Are you sure you want to delete this collection request? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.collectionService.deleteRequest(this.request!.id!).subscribe({
          next: () => {
            this.snackBar.open('Request deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/collection/my-requests']);
          },
          error: (error) => {
            this.snackBar.open(
              error.message || 'Failed to delete request. Only pending requests can be deleted.', 
              'Close', 
              { duration: 3000 }
            );
          }
        });
      }
    });
  }

  navigateBack(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    if (currentUser.role === 'collector') {
      // If the request is occupied/in_progress by this collector, go to my-collections
      if (this.request?.collectorId === currentUser.id && 
          ['occupied', 'in_progress'].includes(this.request.status)) {
        this.router.navigate(['/collection/my-collections']);
      } else {
        // Otherwise go to available requests
        this.router.navigate(['/collection/available']);
      }
    } else {
      // For individuals, always go to my-requests
      this.router.navigate(['/collection/my-requests']);
    }
  }
} 