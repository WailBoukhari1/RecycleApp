import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectAuthUser } from '../../features/auth/store/auth.selectors';

export const checkRoleGuard = () => {
  const router = inject(Router);
  const store = inject(Store);

  return (route: ActivatedRouteSnapshot) => {
    const requiredRole = route.data['requiredRole'];
    
    return store.select(selectAuthUser).pipe(
      take(1),
      map(user => {
        if (!user) {
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.routerState.snapshot.url }
          });
          return false;
        }

        if (user.role !== requiredRole) {
          const correctPath = `/dashboard/${user.role}`;
          router.navigate([correctPath]);
          return false;
        }

        return true;
      })
    );
  };
}; 