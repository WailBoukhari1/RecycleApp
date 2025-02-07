import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MaterialModule } from '../../shared/material.module';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { CreateRequestComponent } from './components/create-request/create-request.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { collectionReducer } from './store/collection.reducer';
import { CollectionEffects } from './store/collection.effects';
import { collectionRoutes } from './collection.routes';
import { CollectionService } from '../../core/services/collection.service';
import { CollectorRequestsComponent } from './components/collector-requests/collector-requests.component';

@NgModule({
  declarations: [
    CreateRequestComponent,
    RequestDetailComponent,
    CollectorRequestsComponent,
    SafeUrlPipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(collectionRoutes),
    ReactiveFormsModule,
    MaterialModule,
    MatTooltipModule,
    StoreModule.forFeature('collection', collectionReducer),
    EffectsModule.forFeature([CollectionEffects])
  ],
  providers: [CollectionService]
})
export class CollectionModule { } 