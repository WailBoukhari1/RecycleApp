import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../../../core/services/collection.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionRequest } from '../../../../core/models/collection.model';

@Component({
  selector: 'app-available-collections',
  templateUrl: './available-collections.component.html',
  styleUrls: ['./available-collections.component.scss']
})
export class AvailableCollectionsComponent implements OnInit {
  availableRequests: CollectionRequest[] = [];
  displayedColumns: string[] = ['date', 'time', 'address', 'wasteTypes', 'totalWeight', 'actions'];

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.address) {
      const city = this.extractCity(currentUser.address);
      this.loadAvailableRequests(city);
    }
  }

  private extractCity(address: string): string {
    return address.split(',').pop()?.trim() || '';
  }

  private loadAvailableRequests(city: string): void {
    this.collectionService.getAvailableRequests(city)
      .subscribe(requests => {
        this.availableRequests = requests;
      });
  }

  viewRequest(id: string): void {
    this.router.navigate(['/collection/detail', id]);
  }

  acceptRequest(request: CollectionRequest): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.collectionService.updateRequestStatus(request.id, 'occupied', currentUser.id)
        .subscribe(() => {
          this.router.navigate(['/collection/detail', request.id]);
        });
    }
  }
} 