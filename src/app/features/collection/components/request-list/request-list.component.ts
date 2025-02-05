import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionRequest } from '../../../../core/models/collection.model';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styles: [`
    :host {
      @apply block p-6;
    }
    .status-chip {
      @apply px-2 py-1 rounded-full text-sm font-medium;
    }
    .status-pending {
      @apply bg-yellow-100 text-yellow-800;
    }
    .status-accepted {
      @apply bg-green-100 text-green-800;
    }
    .status-completed {
      @apply bg-blue-100 text-blue-800;
    }
    .status-cancelled {
      @apply bg-red-100 text-red-800;
    }
  `]
})
export class RequestListComponent implements OnInit {
  requests: CollectionRequest[] = [];
  displayedColumns: string[] = ['wasteType', 'weight', 'date', 'status', 'actions'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO: Load user's collection requests
  }

  viewRequest(id: string): void {
    this.router.navigate(['/collection/detail', id]);
  }

  editRequest(id: string): void {
    // TODO: Implement edit functionality
  }

  deleteRequest(id: string): void {
    // TODO: Implement delete functionality
  }

  getStatusClass(status: string): string {
    return `status-chip status-${status.toLowerCase()}`;
  }
} 