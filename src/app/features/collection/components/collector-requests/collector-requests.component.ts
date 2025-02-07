import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../../../core/services/collection.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionRequest } from '../../../../core/models/collection.model';

@Component({
  selector: 'app-collector-requests',
  templateUrl: './collector-requests.component.html',
})
export class CollectorRequestsComponent implements OnInit {
  collectorRequests: CollectionRequest[] = [];
  displayedColumns: string[] = ['date', 'address', 'status', 'actions'];

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCollectorRequests();
  }

  loadCollectorRequests(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.collectionService.getCollectorRequests(currentUser.id)
      .subscribe({
        next: (requests) => {
          this.collectorRequests = requests;
        },
        error: (error) => {
          this.notificationService.error('Failed to load your collection requests');
        }
      });
  }
} 