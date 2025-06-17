import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule, HeaderComponent, HttpClientModule]
})
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthenticationService);

  private userSubscription: Subscription;
  isAuthenticated = false;

  ngOnInit(): void {
    this.authService.autologin();
    if (this.authService.user) {
      this.userSubscription = this.authService.user.subscribe(user => {
        this.isAuthenticated = !!user;
      })
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription?.unsubscribe();
    }
  }
}
