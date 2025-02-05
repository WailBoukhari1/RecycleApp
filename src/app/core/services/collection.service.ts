import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CollectionRequest, RequestStatus, POINTS_CONFIG } from '../models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly COLLECTIONS_KEY = 'collections';

  constructor() {
    this.initializeCollections();
  }

  private initializeCollections(): void {
    if (!localStorage.getItem(this.COLLECTIONS_KEY)) {
      localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify([]));
    }
  }

  private getCollections(): CollectionRequest[] {
    const collectionsStr = localStorage.getItem(this.COLLECTIONS_KEY);
    return collectionsStr ? JSON.parse(collectionsStr) : [];
  }

  private saveCollections(collections: CollectionRequest[]): void {
    localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));
  }

  createRequest(request: Omit<CollectionRequest, 'id' | 'createdAt' | 'status' | 'updatedAt'>): Observable<CollectionRequest> {
    const newRequest: CollectionRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    };
    const collections = this.getCollections();
    collections.push(newRequest);
    this.saveCollections(collections);
    return of(newRequest);
  }

  getRequestById(id: string): Observable<CollectionRequest> {
    const collections = this.getCollections();
    const request = collections.find(r => r.id === id);
    if (!request) {
      return throwError(() => new Error('Request not found'));
    }
    return of(request);
  }

  getPendingRequests(): Observable<CollectionRequest[]> {
    const collections = this.getCollections();
    return of(collections.filter(request => request.status === 'pending'));
  }

  getAvailableRequests(city: string): Observable<CollectionRequest[]> {
    const collections = this.getCollections();
    return of(collections.filter(request => 
      request.city === city && request.status === 'pending'
    ));
  }

  updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    collectorId: string,
    verifiedWeight?: number,
    photos?: File[]
  ): Observable<CollectionRequest> {
    const collections = this.getCollections();
    const index = collections.findIndex(r => r.id === requestId);
    
    if (index === -1) {
      return throwError(() => new Error('Request not found'));
    }

    const updatedRequest: CollectionRequest = {
      ...collections[index],
      status,
      collectorId,
      verifiedWeight,
      collectorPhotos: photos?.map(photo => URL.createObjectURL(photo)),
      updatedAt: new Date().toISOString()
    };

    if (status === 'validated' && verifiedWeight) {
      let totalPoints = 0;
      updatedRequest.wastes.forEach(waste => {
        const pointsPerKg = POINTS_CONFIG[waste.type];
        totalPoints += pointsPerKg * (waste.weight / 1000); // Convert grams to kg for points calculation
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
