import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../../../core/services/collection.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionRequest, RequestStatus } from '../../../../core/models/collection.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-available-collections',
  templateUrl: './available-collections.component.html',
  styleUrls: ['./available-collections.component.scss']
})
export class AvailableCollectionsComponent implements OnInit {
  availableRequests: CollectionRequest[] = [];
  displayedColumns: string[] = ['date', 'time', 'address', 'wasteTypes', 'totalWeight', 'actions'];
  currentUser: any;
  private currentCity: string = '';

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.address) {
      this.currentCity = this.extractCity(currentUser.address);
      this.loadAvailableRequests(this.currentCity);
    }
    this.currentUser = currentUser;
  }

  private extractCity(address: string): string {
    return address.split(',').pop()?.trim() || '';
  }

  private loadAvailableRequests(city: string = this.currentCity): void {
    if (!city) return;
    this.collectionService.getAvailableRequests(city)
      .subscribe(requests => {
        this.availableRequests = requests;
      });
  }

  viewRequest(id: string): void {
    this.router.navigate(['/collection/detail', id]);
  }

  acceptRequest(request: CollectionRequest) {
    if (!request.id) {
      return;
    }
    this.collectionService.updateRequestStatus(request.id, 'occupied' as RequestStatus, this.currentUser.id)
      .subscribe({
        next: (updatedRequest) => {
          this.snackBar.open('Request accepted successfully', 'Close', { duration: 3000 });
          this.loadAvailableRequests(this.currentCity);
        },
        error: (error) => {
          this.snackBar.open('Failed to accept request', 'Close', { duration: 3000 });
        }
      });
  }
} 