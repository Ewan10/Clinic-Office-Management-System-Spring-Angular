import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private userSubscriprition: Subscription;
  isAuthenticated = false;

  ngOnInit(): void {
    this.userSubscriprition = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  onLogout() {
    this.authService.logout();
  }

  onPatients() {
    this.router.navigate(['/patients']);
  }

  ngOnDestroy(): void {
    this.userSubscriprition.unsubscribe();
  }
}
