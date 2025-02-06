import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { User } from '../../../../core/models/user.model';
import { CollectionRequest } from '../../../../core/models/collection.model';

@Component({
  selector: 'app-collector-dashboard',
  templateUrl: './collector-dashboard.component.html',
  styles: [`
    :host {
      @apply block;
    }
  `]
})
export class CollectorDashboardComponent implements OnInit {
  user$: Observable<User | null>;
  totalCollections$: Observable<number> = of(0);
  activeCollections$: Observable<number> = of(0);
  totalWeight$: Observable<number> = of(0);
  availableRequests$: Observable<number> = of(0);
  recentCollections$: Observable<CollectionRequest[]> = of([]);

  constructor(
    private authService: AuthService,
    private collectionService: CollectionService,
    private router: Router
  ) {
    this.user$ = this.authService.currentUser$;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      // Get all requests for the collector's city
      const allRequests$ = this.collectionService.getAvailableRequests(currentUser.address.city);

      // Calculate total collections (validated requests)
      this.totalCollections$ = allRequests$.pipe(
        map(requests => requests.filter(r => r.status === 'validated' && r.collectorId === currentUser.id).length)
      );

      // Calculate active collections (occupied or in_progress)
      this.activeCollections$ = allRequests$.pipe(
        map(requests => requests.filter(r => 
          (r.status === 'occupied' || r.status === 'in_progress') && 
          r.collectorId === currentUser.id
        ).length)
      );

      // Calculate total weight collected
      this.totalWeight$ = allRequests$.pipe(
        map(requests => requests
          .filter(r => r.status === 'validated' && r.collectorId === currentUser.id)
          .reduce((total, req) => total + (req.verifiedWeight || req.totalWeight) / 1000, 0)
        )
      );

      // Get available requests count
      this.availableRequests$ = allRequests$.pipe(
        map(requests => requests.filter(r => r.status === 'pending').length)
      );

      // Get recent collections (last 5 validated or in-progress)
      this.recentCollections$ = allRequests$.pipe(
        map(requests => requests
          .filter(r => r.collectorId === currentUser.id)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
        )
      );
    }
  }

  ngOnInit(): void {}

  navigateToAvailableCollections(): void {
    this.router.navigate(['/collection/available']);
  }

  navigateToActiveCollections(): void {
    this.router.navigate(['/collection/active']);
  }
}
