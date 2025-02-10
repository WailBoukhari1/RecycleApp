import { Injectable } from '@angular/core';
import { Observable, of, throwError, from } from 'rxjs';
import { CollectionRequest, RequestStatus, POINTS_CONFIG, COLLECTION_CONSTRAINTS } from '../models/collection.model';
import { AuthService } from './auth.service';
import { map, tap, catchError } from 'rxjs/operators';
import { PointsService } from './points.service';
import { NotificationService } from './notification.service';
import { Store } from '@ngrx/store';
import * as PointsActions from '../../features/points/store/points.actions';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly COLLECTIONS_KEY = 'collections';
  private readonly MAX_WEIGHT_KG = 10;
  private readonly MIN_WEIGHT_GRAMS = 1000;

  constructor(
    private authService: AuthService,
    private pointsService: PointsService,
    private notificationService: NotificationService,
    private store: Store
  ) {
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
      validatedWeight: verifiedWeight,
      validatedAt: status === 'validated' ? new Date().toISOString() : undefined,
      collectorPhotos: photos?.map(photo => URL.createObjectURL(photo)),
      updatedAt: new Date().toISOString()
    };

    if (status === 'validated' && verifiedWeight) {
      const totalPoints = Math.floor(this.calculatePoints(updatedRequest));
      updatedRequest.pointsAwarded = totalPoints;

      // Only award points if points were calculated and not already awarded
      if (totalPoints > 0 && updatedRequest.userId && !collections[index].pointsAwarded) {
        // Save request first without points
        collections[index] = { ...updatedRequest, pointsAwarded: undefined };
        this.saveCollections(collections);

        // Then award points using points service
        this.pointsService.earnPoints(
          updatedRequest.userId,
          totalPoints,
          updatedRequest.id,
          `Recycling points for collection #${updatedRequest.id}`
        ).subscribe({
          next: ({ newBalance }) => {
            // Update request with points after successful points award
            collections[index] = updatedRequest;
            this.saveCollections(collections);
            
            // Update user's points in profile
            const user = this.authService.getCurrentUser();
            if (user) {
              this.authService.updateUser(user.id, { points: newBalance }).subscribe();
            }
            
            this.notificationService.success(`Successfully awarded ${totalPoints} points!`);
          },
          error: (error) => {
            this.notificationService.error('Failed to award points: ' + error.message);
          }
        });
      }
    } else {
      collections[index] = updatedRequest;
      this.saveCollections(collections);
    }

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

  validateRequest(requestId: string, validatedWeight: number): Observable<CollectionRequest> {
    const requests = this.getCollections();
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      return throwError(() => new Error('Request not found'));
    }

    const updatedRequest: CollectionRequest = {
      ...requests[requestIndex],
      status: 'validated',
      validatedWeight,
      updatedAt: new Date().toISOString()
    };

    const points = this.calculatePoints(updatedRequest);
    console.log('Calculated points:', {
      validatedWeight,
      points,
      request: updatedRequest
    });

    if (points > 0 && updatedRequest.userId) {
      updatedRequest.pointsAwarded = points;

      // Save request first without points
      requests[requestIndex] = { ...updatedRequest, pointsAwarded: undefined };
      this.saveCollections(requests);

      // Then award points using NgRx store only
      this.store.dispatch(PointsActions.earnPoints({
        userId: updatedRequest.userId,
        points,
        collectionId: updatedRequest.id,
        description: `Recycling points for collection #${updatedRequest.id}`
      }));

      // Update request with points after dispatch
      requests[requestIndex] = updatedRequest;
      this.saveCollections(requests);
    } else {
      // Save request without points
      requests[requestIndex] = updatedRequest;
      this.saveCollections(requests);
    }

    return of(updatedRequest);
  }

  private calculatePoints(request: CollectionRequest): number {
    if (!request.wastes?.length || !request.validatedWeight) {
      console.log('Missing wastes or validatedWeight:', request);
      return 0;
    }

    // We should use validatedWeight instead of original waste weight
    const totalValidatedWeight = request.validatedWeight; // in grams
    const totalOriginalWeight = request.wastes.reduce((sum, waste) => sum + waste.weight, 0);

    const points = request.wastes.reduce((total, waste) => {
      // Calculate proportion of this waste type
      const proportion = waste.weight / totalOriginalWeight;
      // Apply proportion to validated weight and convert to kg
      const validatedWasteWeight = (totalValidatedWeight * proportion) / 1000;
      const pointsPerKg = POINTS_CONFIG[waste.type] || 0;
      const wastePoints = validatedWasteWeight * pointsPerKg;

      console.log('Waste points calculation:', {
        type: waste.type,
        originalWeight: waste.weight,
        proportion,
        validatedWasteWeight,
        pointsPerKg,
        wastePoints
      });

      return total + wastePoints;
    }, 0);

    console.log('Final points calculation:', {
      totalValidatedWeight,
      totalOriginalWeight,
      points
    });

    return points;
  }

  private awardPoints(request: CollectionRequest, points: number): Observable<void> {
    if (!request.userId || points <= 0) {
      return of(void 0);
    }

    return from(this.pointsService.earnPoints(
      request.userId,
      points,
      request.id,
      `Recycling points for collection #${request.id}`
    )).pipe(
      map(() => void 0),
      tap(() => {
        this.notificationService.success(`Awarded ${points} points for recycling!`);
      }),
      catchError(error => {
        this.notificationService.error('Failed to award points: ' + error.message);
        return throwError(() => error);
      })
    );
  }
}