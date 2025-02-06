import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollectionRequest, RequestStatus } from '../../../../core/models/collection.model';
import { selectAllRequests } from '../../store/collection.selectors';
import { loadUserRequests, deleteCollectionRequest } from '../../store/collection.actions';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CollectionService } from '../../../../core/services/collection.service';
import { AuthService } from '../../../../core/services/auth.service';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule
  ],
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
export class RequestListComponent implements OnInit, OnDestroy {
  requests$: Observable<CollectionRequest[]>;
  userRole: 'individual' | 'collector';
  currentUser = this.authService.getCurrentUser();
  private destroy$ = new Subject<void>();
  totalRequests$ = this.store.select(selectAllRequests).pipe(
    map(requests => requests?.length || 0)
  );
  pendingRequests$ = this.store.select(selectAllRequests).pipe(
    map(requests => requests?.filter(r => r.status === 'pending').length || 0)
  );
  completedRequests$ = this.store.select(selectAllRequests).pipe(
    map(requests => requests?.filter(r => r.status === 'validated').length || 0)
  );
  displayedColumns: string[] = [
    'wastes',
    'totalWeight',
    'date',
    'timeSlot',
    'status',
    'actions'
  ];

  constructor(
    private router: Router,
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private collectionService: CollectionService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.userRole = this.currentUser?.role || 'individual';
    this.requests$ = this.store.select(selectAllRequests);
  }

  ngOnInit(): void {
    // Check route data for role-specific view
    const routeRole = this.route.snapshot.data['role'];
    if (routeRole && routeRole !== this.userRole) {
      this.snackBar.open('You do not have permission to access this page', 'Close', { duration: 3000 });
      this.router.navigate(['/collection', this.userRole === 'collector' ? 'available' : 'my-requests']);
      return;
    }

    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRequests(): void {
    if (!this.currentUser) {
      this.snackBar.open('Please log in to view requests', 'Close', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.userRole === 'collector') {
      // Load requests from the same city for collectors
      this.collectionService.getAvailableRequests(this.currentUser.address.city).subscribe({
        next: (requests) => {
          this.requests$ = new Observable(observer => observer.next(requests));
        },
        error: (error) => {
          this.snackBar.open('Failed to load available requests', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Load user's own requests for individuals
      this.store.dispatch(loadUserRequests());
    }
  }

  viewRequest(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/collection/detail', id]);
    }
  }

  editRequest(request: CollectionRequest): void {
    if (!request.id) return;

    if (request.status !== 'pending') {
      this.snackBar.open('Only pending requests can be edited', 'Close', {
        duration: 3000
      });
      return;
    }

    this.router.navigate(['/collection/edit', request.id]);
  }

  deleteRequest(request: CollectionRequest): void {
    if (!request.id) return;

    if (request.status !== 'pending') {
      this.snackBar.open('Only pending requests can be deleted', 'Close', {
        duration: 3000
      });
      return;
    }

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
        this.collectionService.deleteRequest(request.id!).subscribe({
          next: () => {
            this.snackBar.open('Request deleted successfully', 'Close', { duration: 3000 });
            this.loadRequests();
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

  acceptRequest(request: CollectionRequest): void {
    if (!request.id || !this.currentUser) return;

    // Verify city match before accepting
    if (request.userCity.toLowerCase() !== this.currentUser.address.city.toLowerCase()) {
      this.snackBar.open(
        'You can only accept requests from your city', 
        'Close', 
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Accept Collection Request',
        message: `Are you sure you want to accept this collection request? 
                 You will be responsible for collecting ${request.totalWeight / 1000}kg of waste.`,
        confirmText: 'Accept',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.collectionService.updateRequestStatus(
            request.id!,
            'occupied',
            this.currentUser!.id
          ).subscribe({
            next: () => {
              this.snackBar.open('Request accepted successfully', 'Close', { duration: 3000 });
              this.loadRequests();
            },
            error: (error) => {
              this.snackBar.open('Failed to accept request', 'Close', { duration: 3000 });
            }
          });
        }
      });
  }

  getStatusClass(status: RequestStatus): string {
    return `status-chip status-${status.toLowerCase()}`;
  }

  getWasteTypes(request: CollectionRequest): string {
    return request.wastes.map(w => w.type).join(', ');
  }

  getTotalWeight(request: CollectionRequest): number {
    return request.totalWeight / 1000; // Convert grams to kg
  }

  canEditRequest(request: CollectionRequest): boolean {
    return this.userRole === 'individual' && request.status === 'pending';
  }

  canDeleteRequest(request: CollectionRequest): boolean {
    return this.userRole === 'individual' && request.status === 'pending';
  }

  canAcceptRequest(request: CollectionRequest): boolean {
    return this.userRole === 'collector' && request.status === 'pending';
  }
} 