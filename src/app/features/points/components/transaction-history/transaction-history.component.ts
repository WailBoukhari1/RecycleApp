import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PointsService } from '../../../../core/services/points.service';
import { PointTransaction } from '../../../../core/models/points.model';

@Component({
  selector: 'app-transaction-history',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Transaction History</mat-card-title>
      </mat-card-header>
      <mat-card-content class="p-4">
        <div class="space-y-4">
          <div *ngFor="let transaction of pointsService.transactions$ | async" 
               class="p-4 border rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">
                  {{ transaction.type === 'EARNED' ? 'Earned' : 'Redeemed' }}
                  {{ transaction.amount }} points
                </div>
                <div class="text-sm text-gray-500">
                  {{ transaction.timestamp | date:'medium' }}
                </div>
              </div>
              <div [class]="transaction.type === 'EARNED' ? 'text-green-600' : 'text-red-600'">
                {{ transaction.type === 'EARNED' ? '+' : '-' }}{{ transaction.amount }}
              </div>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class TransactionHistoryComponent {
  constructor(public pointsService: PointsService) {}
} 