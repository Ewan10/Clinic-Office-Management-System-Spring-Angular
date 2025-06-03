import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './header/header.component';
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

  authService = inject(AuthenticationService);
  private userSubscriprition: Subscription;
  isAuthenticated = false;

  ngOnInit(): void {
    this.userSubscriprition = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      this.authService.autologin();
    })
  }


  ngOnDestroy(): void {
    this.userSubscriprition.unsubscribe();
  }
}
