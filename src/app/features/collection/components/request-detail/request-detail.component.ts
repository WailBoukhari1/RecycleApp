import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionService } from '../../../../core/services/collection.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionRequest, CollectionStatus } from '../../../../core/models/collection.model';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styles: [`
    :host {
      @apply block p-6;
    }
    .status-chip {
      @apply px-2 py-1 rounded-full text-sm font-medium;
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
  verificationForm: FormGroup;
  userRole: 'collector' | 'individual' | null = null;
  selectedPhotos: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private collectionService: CollectionService,
    private authService: AuthService
  ) {
    this.verificationForm = this.fb.group({
      verifiedWeight: ['', [Validators.required, Validators.min(0.1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || null;

    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      // TODO: Get request details from service
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedPhotos = Array.from(input.files);
    }
  }

  updateStatus(status: CollectionStatus): void {
    if (!this.request) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    if (status === 'validated' || status === 'rejected') {
      if (!this.verificationForm.valid) return;

      const { verifiedWeight } = this.verificationForm.value;
      this.collectionService.updateRequestStatus(
        this.request.id,
        status,
        currentUser.id,
        verifiedWeight,
        this.selectedPhotos.map(file => URL.createObjectURL(file))
      ).subscribe(() => {
        this.router.navigate(['/collection/available']);
      });
    } else {
      this.collectionService.updateRequestStatus(
        this.request.id,
        status,
        currentUser.id
      ).subscribe(() => {
        // Refresh the request details
      });
    }
  }

  getStatusClass(status: string): string {
    return `status-chip status-${status.toLowerCase()}`;
  }
} 