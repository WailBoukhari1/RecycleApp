import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CollectionRequest, RequestStatus, POINTS_CONFIG, COLLECTION_CONSTRAINTS } from '../models/collection.model';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly COLLECTIONS_KEY = 'collections';
  private readonly MAX_WEIGHT_KG = 10;
  private readonly MIN_WEIGHT_GRAMS = 1000;

  constructor(private authService: AuthService) {
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

  getAllCollections(): CollectionRequest[] {
    return this.getCollections();
  }

  private normalizeCity(city: string): string {
    // Remove extra spaces, make lowercase, and remove special characters
    return city.trim()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9\s]/g, '');
  }

  private validateRequestWeight(request: any): { isValid: boolean; message?: string } {
    const totalWeight = request.wastes.reduce((sum: number, waste: any) => sum + waste.weight, 0);
    
    if (totalWeight < this.MIN_WEIGHT_GRAMS) {
      return { 
        isValid: false, 
        message: `Minimum total weight must be ${this.MIN_WEIGHT_GRAMS / 1000}kg` 
      };
    }

    if (totalWeight > this.MAX_WEIGHT_KG * 1000) {
      return { 
        isValid: false, 
        message: `Maximum total weight cannot exceed ${this.MAX_WEIGHT_KG}kg` 
      };
    }

    return { isValid: true };
  }

  createRequest(request: Omit<CollectionRequest, 'id' | 'createdAt' | 'status' | 'updatedAt'>): Observable<CollectionRequest> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    if (!currentUser.address?.city) {
      return throwError(() => new Error('User profile is incomplete: missing city'));
    }

    // Validate total weight
    const weightValidation = this.validateRequestWeight(request);
    if (!weightValidation.isValid) {
      return throwError(() => new Error(weightValidation.message));
    }

    const newRequest: CollectionRequest = {
      ...request,
      id: Date.now().toString(),
      userId: currentUser.id,
      userCity: currentUser.address.city, // Use the actual city from user's address
      collectionAddress: request.collectionAddress || currentUser.address.street + ', ' + currentUser.address.district + ', ' + currentUser.address.city,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    };

    console.log('Creating new request with city:', newRequest.userCity);

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
    const currentUser = this.authService.getCurrentUser();
    return of(collections.filter(request => 
      request.userId === currentUser?.id && request.status === 'pending'
    ));
  }

  getAvailableRequests(collectorCity: string): Observable<CollectionRequest[]> {
    if (!collectorCity) {
      return throwError(() => new Error('Collector city is required'));
    }

    const collections = this.getCollections();
    // Show only pending requests from the collector's city
    const cityRequests = collections.filter(request => 
      request.userCity.toLowerCase() === collectorCity.toLowerCase() &&
      request.status === 'pending' &&
      !request.collectorId
    );

    console.log('Available requests debug:', {
      collectorCity,
      totalRequests: collections.length,
      cityRequests: cityRequests.length,
      requestCities: collections.map(r => r.userCity),
      matches: cityRequests
    });
    
    return of(cityRequests);
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

    // Verify city match before updating status
    const collector = this.authService.getCurrentUser();
    if (!collector?.address?.city) {
      return throwError(() => new Error('Collector profile is incomplete'));
    }

    if (this.normalizeCity(collections[index].userCity) !== this.normalizeCity(collector.address.city)) {
      return throwError(() => new Error('City mismatch: Collector can only handle requests from their city'));
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

  getUserRequests(): Observable<CollectionRequest[]> {
    const collections = this.getCollections();
    const currentUser = this.authService.getCurrentUser();
    return of(collections.filter(request => request.userId === currentUser?.id));
  }

  // Get collector's active requests (occupied, in_progress)
  getCollectorRequests(collectorId: string): Observable<CollectionRequest[]> {
    if (!collectorId) {
      return throwError(() => new Error('Collector ID is required'));
    }

    const collections = this.getCollections();
    const collectorRequests = collections.filter(request => 
      request.collectorId === collectorId && 
      ['occupied', 'in_progress'].includes(request.status)
    );

    console.log('Collector requests debug:', {
      collectorId,
      totalRequests: collections.length,
      activeRequests: collectorRequests.length,
      requests: collectorRequests
    });
    
    return of(collectorRequests);
  }
} 
