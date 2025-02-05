import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectAuthUser } from '../../features/auth/store/auth.selectors';

export const noAuthGuard = () => {
  const router = inject(Router);
  const store = inject(Store);
  
  return store.select(selectAuthUser).pipe(
    take(1),
    map(user => {
      if (user) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    })
  );
}; 