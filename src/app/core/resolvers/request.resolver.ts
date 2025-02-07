import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CollectionRequest } from '../models/collection.model';
import { CollectionService } from '../services/collection.service';

@Injectable({
  providedIn: 'root'
})
export class RequestResolver implements Resolve<CollectionRequest | null> {
  constructor(private collectionService: CollectionService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CollectionRequest | null> {
    const requestId = route.paramMap.get('id');
    if (!requestId) {
      return of(null); // New request
    }
    return this.collectionService.getRequestById(requestId);
  }
} 