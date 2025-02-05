import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CollectionRequest, CollectionStatus, POINTS_CONFIG } from '../models/collection.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly COLLECTIONS_KEY = 'collections';
  private readonly MAX_PENDING_REQUESTS = 3;
  private readonly MAX_TOTAL_WEIGHT = 10;

  constructor(private authService: AuthService) {}

  private getCollections(): CollectionRequest[] {
    const collectionsStr = localStorage.getItem(this.COLLECTIONS_KEY);
    return collectionsStr ? JSON.parse(collectionsStr) : [];
  }

  private saveCollections(collections: CollectionRequest[]): void {
    localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));
  }

  createRequest(requestData: Omit<CollectionRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Observable<CollectionRequest> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Check total weight
    if (requestData.totalWeight > this.MAX_TOTAL_WEIGHT) {
      return throwError(() => new Error(`Total weight cannot exceed ${this.MAX_TOTAL_WEIGHT}kg`));
    }

    // Check pending requests limit
    const userCollections = this.getCollections().filter(c => 
      c.userId === currentUser.id && 
      c.status === 'pending'
    );

    if (userCollections.length >= this.MAX_PENDING_REQUESTS) {
      return throwError(() => new Error('Maximum pending requests limit reached'));
    }

    const newRequest: CollectionRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const collections = this.getCollections();
    collections.push(newRequest);
    this.saveCollections(collections);

    return of(newRequest);
  }

  getUserRequests(userId: string): Observable<CollectionRequest[]> {
    const collections = this.getCollections().filter(c => c.userId === userId);
    return of(collections);
  }

  getAvailableRequests(collectorCity: string): Observable<CollectionRequest[]> {
    const collections = this.getCollections().filter(c => 
      c.userCity === collectorCity && 
      c.status === 'pending'
    );
    return of(collections);
  }

  updateRequestStatus(
    requestId: string, 
    status: CollectionStatus, 
    collectorId?: string,
    verifiedWeight?: number,
    collectorPhotos?: string[]
  ): Observable<CollectionRequest> {
    const collections = this.getCollections();
    const index = collections.findIndex(c => c.id === requestId);

    if (index === -1) {
      return throwError(() => new Error('Collection request not found'));
    }

    const updatedRequest = {
      ...collections[index],
      status,
      updatedAt: new Date().toISOString()
    };

    if (collectorId) {
      updatedRequest.collectorId = collectorId;
    }

    if (verifiedWeight !== undefined) {
      updatedRequest.verifiedWeight = verifiedWeight;
    }

    if (collectorPhotos) {
      updatedRequest.collectorPhotos = collectorPhotos;
    }

    // Calculate points if request is validated
    if (status === 'validated' && verifiedWeight) {
      let totalPoints = 0;
      updatedRequest.wastes.forEach(waste => {
        const pointsPerKg = POINTS_CONFIG[waste.type];
        totalPoints += pointsPerKg * waste.weight;
      });
      updatedRequest.pointsAwarded = totalPoints;
    }

    collections[index] = updatedRequest;
    this.saveCollections(collections);

    return of(updatedRequest);
  }

  deleteRequest(requestId: string): Observable<void> {
    const collections = this.getCollections();
    const index = collections.findIndex(c => c.id === requestId);

    if (index === -1) {
      return throwError(() => new Error('Collection request not found'));
    }

    if (collections[index].status !== 'pending') {
      return throwError(() => new Error('Only pending requests can be deleted'));
    }

    collections.splice(index, 1);
    this.saveCollections(collections);

    return of(void 0);
  }

  updateRequest(requestId: string, updateData: Partial<CollectionRequest>): Observable<CollectionRequest> {
    const collections = this.getCollections();
    const index = collections.findIndex(c => c.id === requestId);

    if (index === -1) {
      return throwError(() => new Error('Collection request not found'));
    }

    if (collections[index].status !== 'pending') {
      return throwError(() => new Error('Only pending requests can be updated'));
    }

    const updatedRequest = {
      ...collections[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    collections[index] = updatedRequest;
    this.saveCollections(collections);

    return of(updatedRequest);
  }
} 