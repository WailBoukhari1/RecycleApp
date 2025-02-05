import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { collectionRoutes } from './collection.routes';

import { CreateRequestComponent } from './components/create-request/create-request.component';
import { RequestListComponent } from './components/request-list/request-list.component';
import { AvailableCollectionsComponent } from './components/available-collections/available-collections.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';

@NgModule({
  declarations: [
    CreateRequestComponent,
    RequestListComponent,
    AvailableCollectionsComponent,
    RequestDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(collectionRoutes),
    MaterialModule,
    MatTableModule,
    MatSelectModule
  ]
})
export class CollectionModule { } 