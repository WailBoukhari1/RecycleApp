import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { CollectionRequest } from '../../../../core/models/collection.model';
import { CollectionService } from '../../../../core/services/collection.service';

@Component({
  selector: 'app-points-history',
  templateUrl: './points-history.component.html',
})
export class PointsHistoryComponent implements OnInit {
  validatedRequests$: Observable<CollectionRequest[]>;
  displayedColumns = ['date', 'wastes', 'points'];

  constructor(private collectionService: CollectionService) {
    this.validatedRequests$ = this.collectionService.getUserRequests().pipe(
      map(requests => requests.filter(r => r.status === 'validated'))
    );
  }

  ngOnInit(): void {}
} 