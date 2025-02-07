import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [`
    :host {
      @apply block sticky top-0 z-50;
    }
    .mat-toolbar {
      @apply px-4;
    }
    nav {
      @apply flex items-center space-x-2;
    }
  `]
})
export class NavbarComponent {
  user$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authService.currentUser$;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToRequests(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === 'collector') {
      this.router.navigate(['/collection/available']);
    } else {
      this.router.navigate(['/collection/my-requests']);
    }
  }

  navigateToMyCollections(): void {
    this.router.navigate(['/collection/my-collections']);
  }

  navigateToPoints(): void {
    this.router.navigate(['/points']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}