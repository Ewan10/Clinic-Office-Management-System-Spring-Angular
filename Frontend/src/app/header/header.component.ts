import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';
import { PatientsService } from '../services/patients.service';
import { AppointmentsService } from '../services/appointments.service';
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
  private userSubscriprition: Subscription;
  isAuthenticated = false;

  ngOnInit(): void {
    this.userSubscriprition = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  constructor(private authService: AuthenticationService,
    private patientsService: PatientsService,
    private appointmentsService: AppointmentsService,
    private router: Router,
  ) { }

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
